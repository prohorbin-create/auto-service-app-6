"""
Записи на обслуживание: создание и просмотр записей
"""
import json
import os
import psycopg2

CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
}


def get_conn():
    return psycopg2.connect(os.environ['DATABASE_URL'])


def handler(event: dict, context) -> dict:
    """Создание записи на обслуживание"""
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'body': ''}

    method = event.get('httpMethod', 'GET')
    headers = event.get('headers') or {}
    user_id = headers.get('X-User-Id') or headers.get('x-user-id')

    # POST / — создать запись
    if method == 'POST':
        body = json.loads(event.get('body') or '{}')
        name = body.get('name', '').strip()
        phone = body.get('phone', '').strip()
        service = body.get('service', '').strip()
        date = body.get('date', '')
        time = body.get('time', '')
        comment = body.get('comment', '')

        if not name or not phone or not service or not date or not time:
            return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'ok': False, 'error': 'Заполните все обязательные поля'})}

        conn = get_conn()
        cur = conn.cursor()
        cur.execute(
            "INSERT INTO bookings (user_id, name, phone, service, date, time, comment) VALUES (%s,%s,%s,%s,%s,%s,%s) RETURNING id",
            (user_id or None, name, phone, service, date, time, comment)
        )
        booking_id = cur.fetchone()[0]
        conn.commit()
        conn.close()

        return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'ok': True, 'id': booking_id})}

    # GET / — список записей (только для авторизованных)
    if method == 'GET' and user_id:
        conn = get_conn()
        cur = conn.cursor()
        cur.execute(
            "SELECT id, service, date, time, status, comment FROM bookings WHERE user_id=%s ORDER BY id DESC",
            (user_id,)
        )
        rows = cur.fetchall()
        conn.close()
        bookings = [{'id': r[0], 'service': r[1], 'date': r[2], 'time': r[3], 'status': r[4], 'comment': r[5] or ''} for r in rows]
        return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'ok': True, 'bookings': bookings})}

    return {'statusCode': 404, 'headers': CORS, 'body': json.dumps({'error': 'Not found'})}
