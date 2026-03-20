"""
Заказ-наряды: CRUD для администратора автосервиса
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


def row_to_order(r):
    return {
        'id': r[0], 'order_number': r[1], 'client_name': r[2], 'client_phone': r[3],
        'car': r[4], 'service': r[5], 'date': r[6], 'time': r[7], 'master': r[8] or '',
        'status': r[9], 'total': r[10], 'comment': r[11] or ''
    }


def handler(event: dict, context) -> dict:
    """CRUD заказ-нарядов для администратора"""
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'body': ''}

    method = event.get('httpMethod', 'GET')
    path = event.get('path', '/')
    body = json.loads(event.get('body') or '{}')
    params = event.get('queryStringParameters') or {}

    conn = get_conn()
    cur = conn.cursor()

    # GET / — список всех заказов
    if method == 'GET':
        status_filter = params.get('status')
        if status_filter and status_filter != 'all':
            cur.execute(
                "SELECT id, order_number, client_name, client_phone, car, service, date, time, master, status, total, comment FROM orders WHERE status=%s ORDER BY id DESC",
                (status_filter,)
            )
        else:
            cur.execute(
                "SELECT id, order_number, client_name, client_phone, car, service, date, time, master, status, total, comment FROM orders ORDER BY id DESC"
            )
        rows = cur.fetchall()
        conn.close()
        return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'ok': True, 'orders': [row_to_order(r) for r in rows]})}

    # POST / — создать заказ-наряд
    if method == 'POST' and not any(path.endswith(s) for s in ['/status', '/update']):
        required = ['client_name', 'client_phone', 'car', 'service', 'date', 'time']
        if not all(body.get(f) for f in required):
            conn.close()
            return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'ok': False, 'error': 'Заполните обязательные поля'})}

        # Генерируем номер заказа
        cur.execute("SELECT order_number FROM orders ORDER BY id DESC LIMIT 1")
        last = cur.fetchone()
        if last:
            last_num = int(last[0].replace('ЗН-', ''))
            new_num = f'ЗН-{str(last_num + 1).zfill(4)}'
        else:
            new_num = 'ЗН-0001'

        cur.execute(
            "INSERT INTO orders (order_number, client_name, client_phone, car, service, date, time, master, status, total, comment) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s) RETURNING id",
            (new_num, body['client_name'], body['client_phone'], body['car'], body['service'], body['date'], body['time'], body.get('master', ''), body.get('status', 'scheduled'), body.get('total', 0), body.get('comment', ''))
        )
        order_id = cur.fetchone()[0]
        conn.commit()
        conn.close()
        return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'ok': True, 'id': order_id, 'order_number': new_num})}

    # PUT /status — изменить статус
    if method == 'PUT' and path.endswith('/status'):
        order_id = body.get('id')
        new_status = body.get('status')
        if not order_id or not new_status:
            conn.close()
            return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'ok': False, 'error': 'id и status обязательны'})}
        cur.execute("UPDATE orders SET status=%s WHERE id=%s", (new_status, order_id))
        conn.commit()
        conn.close()
        return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'ok': True})}

    # PUT /update — обновить заказ
    if method == 'PUT' and path.endswith('/update'):
        order_id = body.get('id')
        if not order_id:
            conn.close()
            return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'ok': False, 'error': 'id обязателен'})}
        fields = ['client_name', 'client_phone', 'car', 'service', 'date', 'time', 'master', 'status', 'total', 'comment']
        updates = {f: body[f] for f in fields if f in body}
        if updates:
            set_clause = ', '.join(f"{k}=%s" for k in updates)
            cur.execute(f"UPDATE orders SET {set_clause} WHERE id=%s", list(updates.values()) + [order_id])
            conn.commit()
        conn.close()
        return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'ok': True})}

    conn.close()
    return {'statusCode': 404, 'headers': CORS, 'body': json.dumps({'error': 'Not found'})}
