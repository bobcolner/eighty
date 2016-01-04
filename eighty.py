import os
import json
import requests

API_TOKEN = os.environ["EIGHTYLEGS_API"]

# see: http://datafiniti.github.io/80docs/?python

def get_user():
    response = requests.get("https://{api_token}:@api.80legs.com/v2/users/{api_token}".format(api_token=API_TOKEN))
    return response.json()

def list_data():
    response = requests.get("https://{api_token}:@api.80legs.com/v2/data".format(api_token=API_TOKEN))
    return response.json()

def list_urls():
    response = requests.get("https://{api_token}:@api.80legs.com/v2/urllists".format(api_token=API_TOKEN))
    return response.json()

def get_url(url_name):
    response = requests.get("https://{api_token}:@api.80legs.com/v2/urllists/{url_name}".format(api_token=API_TOKEN, url_name=url_name))
    return response.json()

def create_urls(url_name, url_list):

    def data_to_json_file(data, filename='temp.json'):
        with open(filename, 'w') as outfile:
            json.dump(data, outfile, ensure_ascii=False)
        return filename

    try:    
        data_path = data_to_json_file(data=url_list)
        url = "https://{api_token}:@api.80legs.com/v2/urllists/{url_name}".format(api_token=API_TOKEN, url_name=url_name)
        data = open(data_path, "rb")
        resp = requests.put(url, data=data, headers={"Content-Type": "application/octet-stream"})
    finally:
        os.remove(data_path)
    return resp

def delete_url(url_name):
    return requests.delete("https://{api_token}:@api.80legs.com/v2/urllists/{url_name}".format(api_token=API_TOKEN, url_name=url_name))

def list_apps():
    response = requests.get("https://{api_token}:@api.80legs.com/v2/apps".format(api_token=API_TOKEN))
    return response.json()

def create_app(app_name, file_path):
    url = "https://{api_token}:@api.80legs.com/v2/apps/{app_name}".format(api_token=API_TOKEN, app_name=app_name)
    file = {"file": open(file_path, "rb")}
    headers = {"content-type": "application/octet-stream"}
    return requests.put(url, files=file, headers=headers)

def delete_app(app_name):
    return "https://{api_token}:@api.80legs.com/v2/apps/{app_name}".format(api_token=API_TOKEN, app_name=app_name)

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

def kill_craw(craw_name):
    return requests.delete("https://{api_token}:@api.80legs.com/v2/crawls/{craw_name}".format(api_token=API_TOKEN, craw_name=craw_name))

def get_result_s3path(craw_name):
    results_resp = requests.get("https://{api_token}:@api.80legs.com/v2/results/{craw_name}".format(api_token=API_TOKEN, craw_name=craw_name))
    return results_resp.json()[0]

def get_result_data(craw_name, json_fix=True):
    craw_resp = get_craw(craw_name)
    if craw_resp['status'] != "COMPLETED":
        return "results not ready"
    results_s3_path = get_result_s3path(craw_name)
    results_data = requests.get(results_s3_path)
    results_sl = results_data.json()
    if json_fix:
        return results_json_to_dict(results_sl)
    else:
        return results_sl
    
def results_json_to_dict(result_sl):
    result_dl = []
    for row in result_sl:
        if 'result' in row:
            try:
                result_dl.append(json.loads(row['result']))
            except:
                pass 
    return result_dl
