"""
Личный кабинет: данные автомобиля и история заказов клиента
"""
import json
import os
import psycopg2

CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
}


def get_conn():
    return psycopg2.connect(os.environ['DATABASE_URL'])


def handler(event: dict, context) -> dict:
    """Данные кабинета клиента: авто и история"""
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'body': ''}

    method = event.get('httpMethod', 'GET')
    path = event.get('path', '/')
    headers = event.get('headers') or {}
    user_id = headers.get('X-User-Id') or headers.get('x-user-id')

    if not user_id:
        return {'statusCode': 401, 'headers': CORS, 'body': json.dumps({'error': 'Не авторизован'})}

    conn = get_conn()
    cur = conn.cursor()

    # GET /car — данные автомобиля
    if method == 'GET' and path.endswith('/car'):
        cur.execute(
            "SELECT id, brand, model, year, plate, vin, color, mileage FROM cars WHERE user_id=%s ORDER BY id DESC LIMIT 1",
            (user_id,)
        )
        row = cur.fetchone()
        conn.close()
        if row:
            car = {'id': row[0], 'brand': row[1], 'model': row[2], 'year': row[3], 'plate': row[4], 'vin': row[5], 'color': row[6], 'mileage': row[7]}
            return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'ok': True, 'car': car})}
        return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'ok': True, 'car': None})}

    # GET /history — история заказов
    if method == 'GET' and path.endswith('/history'):
        cur.execute(
            "SELECT order_number, client_name, service, date, time, master, status, total, comment FROM orders WHERE user_id=%s ORDER BY id DESC",
            (user_id,)
        )
        rows = cur.fetchall()
        conn.close()
        orders = [
            {'id': r[0], 'date': r[3], 'services': [r[2]], 'master': r[5], 'status': r[6], 'total': r[7], 'comment': r[8] or ''}
            for r in rows
        ]
        return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'ok': True, 'orders': orders})}

    # POST /car — добавить/обновить авто
    if method == 'POST' and path.endswith('/car'):
        body = json.loads(event.get('body') or '{}')
        cur.execute("SELECT id FROM cars WHERE user_id=%s LIMIT 1", (user_id,))
        existing = cur.fetchone()
        if existing:
            cur.execute(
                "UPDATE cars SET brand=%s, model=%s, year=%s, plate=%s, vin=%s, color=%s, mileage=%s WHERE user_id=%s",
                (body.get('brand'), body.get('model'), body.get('year'), body.get('plate'), body.get('vin'), body.get('color'), body.get('mileage', 0), user_id)
            )
        else:
            cur.execute(
                "INSERT INTO cars (user_id, brand, model, year, plate, vin, color, mileage) VALUES (%s,%s,%s,%s,%s,%s,%s,%s)",
                (user_id, body.get('brand'), body.get('model'), body.get('year'), body.get('plate'), body.get('vin'), body.get('color'), body.get('mileage', 0))
            )
        conn.commit()
        conn.close()
        return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'ok': True})}

    conn.close()
    return {'statusCode': 404, 'headers': CORS, 'body': json.dumps({'error': 'Not found'})}
