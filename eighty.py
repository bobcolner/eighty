import requests
import json
import os

API_TOKEN = os.environ["EIGHTYLEGS_API"]

# see: http://datafiniti.github.io/80docs/?python

def list_urls():
    response = requests.get("https://{api_token}:@api.80legs.com/v2/urllists".format(api_token=API_TOKEN))
    return response.json()

def create_urls(url_name, file_path):
    url = "https://{api_token}:@api.80legs.com/v2/urllists/{url_name}".format(api_token=API_TOKEN, url_name=url_name)
    files = {"file": open(file_path, "rb")}
    headers = {"content-type": "application/octet-stream"}
    return requests.put(url, files=files, headers=headers)

def list_apps():
    response = requests.get("https://{api_token}:@api.80legs.com/v2/apps".format(api_token=API_TOKEN))
    return response.json()

def create_app(app_name, file_path):
    url = "https://{api_token}:@api.80legs.com/v2/apps/{app_name}".format(api_token=API_TOKEN, app_name=app_name)
    files = {"file": open(file_path, "rb")}
    headers = {"content-type": "application/octet-stream"}
    return requests.put(url, files=files, headers=headers)

def list_craws():
    response = requests.get("https://{api_token}:@api.80legs.com/v2/crawls".format(api_token=API_TOKEN))
    return response.json()
    
def create_craw(craw_name, payload):
    url = "https://{api_token}:@api.80legs.com/v2/crawls/{craw_name}".format(api_token=API_TOKEN, craw_name=craw_name)
    headers = {"content-type": "application/json"}
    return requests.post(url, data=json.dumps(payload), headers=headers)

def get_craw(craw_name):
    response = requests.get("https://{api_token}:@api.80legs.com/v2/crawls/{craw_name}".format(api_token=API_TOKEN, craw_name=craw_name))
    return response.json()

def get_result(craw_name):
    resp_80legs = requests.get("https://{api_token}:@api.80legs.com/v2/results/{craw_name}".format(api_token=API_TOKEN, craw_name=craw_name))
    s3_path = resp_80legs.json()[0]
    resp_s3 = requests.get(s3_path)
    return resp_s3.json()
