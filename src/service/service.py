from flask import Flask, request, jsonify
from flask_cors import CORS
from visited import *

app = Flask(__name__)
CORS(app)


# GET 请求 - 获取特定项目
@app.route('/get_visited_points', methods=['GET'])
def Service_GetVisitedPoints():
    resp = GetVisitedPoints()
    return {"status": "success", "data": resp}, 200



if __name__ == '__main__':
    app.run(port=5000)
