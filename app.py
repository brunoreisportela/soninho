import json

# print(f"SYS PATH: {sys.path}")
# sudo lsof -i -P -n | grep LISTEN

from flask import Flask,request,render_template

# from modules import Talk
# from modules import Whatsapp

app = Flask(__name__)

# talk = Talk()
# whatsapp = Whatsapp()

@app.route("/")
def service():
    return index()

@app.route("/index")
def index():
    return render_template("/index.html")

@app.route("/terms")
def terms():
    return render_template("/terms.html")

@app.route("/sitemap")
def terms():
    return render_template("/terms.html")