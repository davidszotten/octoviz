import sqlite3

from flask import Flask, render_template, jsonify
import sqlite_utils
app = Flask(__name__)

@app.route('/')
def chart():
    return render_template('chart.html')


@app.route('/data')
def data():
    db = sqlite_utils.Database("octopus.db")
    db.conn.row_factory = sqlite3.Row
    rows = db.conn.execute("""
select
  interval_start as t,
  consumption,
  value_inc_vat as price,
  consumption * value_inc_vat as cost
from
  consumption
  join rates on interval_start = valid_from
""").fetchall()
    return jsonify([dict(row) for row in rows])


@app.route('/average')
def average():
    db = sqlite_utils.Database("octopus.db")
    (value,) = db.conn.execute("""
  select sum(consumption * value_inc_vat)/sum(consumption)
from consumption join rates on interval_start = valid_from
""").fetchone()
    return jsonify({'average': value})
