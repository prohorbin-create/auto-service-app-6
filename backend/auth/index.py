"""
Аутентификация: вход и регистрация клиентов автосервиса Автоспектр
"""
import json
import os
import psycopg2


CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Auth-Token',
}


def get_conn():
    return psycopg2.connect(os.environ['DATABASE_URL'])


def handler(event: dict, context) -> dict:
    """Вход и регистрация пользователей"""
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'body': ''}

    method = event.get('httpMethod', 'GET')
    path = event.get('path', '/')
    body = json.loads(event.get('body') or '{}')

    # POST /login
    if method == 'POST' and path.endswith('/login'):
        phone = ''.join(c for c in body.get('phone', '') if c.isdigit())
        password = body.get('password', '')

        conn = get_conn()
        cur = conn.cursor()
        cur.execute(
            "SELECT id, name, role FROM users WHERE phone=%s AND password_hash=%s",
            (phone, password)
        )
        row = cur.fetchone()
        conn.close()

        if row:
            return {
                'statusCode': 200,
                'headers': CORS,
                'body': json.dumps({'ok': True, 'user': {'id': row[0], 'name': row[1], 'role': row[2], 'phone': phone}})
            }
        return {
            'statusCode': 401,
            'headers': CORS,
            'body': json.dumps({'ok': False, 'error': 'Неверный номер телефона или пароль'})
        }

    # POST /register
    if method == 'POST' and path.endswith('/register'):
        phone = ''.join(c for c in body.get('phone', '') if c.isdigit())
        password = body.get('password', '')
        name = body.get('name', '').strip()

        if not phone or not password or not name:
            return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'ok': False, 'error': 'Заполните все поля'})}
        if len(password) < 6:
            return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'ok': False, 'error': 'Пароль минимум 6 символов'})}

        conn = get_conn()
        cur = conn.cursor()
        cur.execute("SELECT id FROM users WHERE phone=%s", (phone,))
        if cur.fetchone():
            conn.close()
            return {'statusCode': 409, 'headers': CORS, 'body': json.dumps({'ok': False, 'error': 'Такой номер уже зарегистрирован'})}

        cur.execute(
            "INSERT INTO users (phone, password_hash, name, role) VALUES (%s, %s, %s, 'client') RETURNING id",
            (phone, password, name)
        )
        user_id = cur.fetchone()[0]
        conn.commit()
        conn.close()

        return {
            'statusCode': 200,
            'headers': CORS,
            'body': json.dumps({'ok': True, 'user': {'id': user_id, 'name': name, 'role': 'client', 'phone': phone}})
        }

    return {'statusCode': 404, 'headers': CORS, 'body': json.dumps({'error': 'Not found'})}