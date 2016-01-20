import os
import json
import requests
from retrying import retry

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
    
    def json_dump_file(data, filename='temp.json'):
        with open(filename, 'w') as outfile:
            json.dump(data, outfile, ensure_ascii=False)
        return filename

    try:    
        url_filepath = json_dump_file(url_list)
        url = "https://{api_token}:@api.80legs.com/v2/urllists/{url_name}".format(api_token=API_TOKEN, url_name=url_name)
        data = open(url_filepath, "rb")
        resp = requests.put(url, data=data, headers={"Content-Type": "application/octet-stream"})
    finally:
        os.remove(url_filepath)
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
    return requests.delete("https://{api_token}:@api.80legs.com/v2/apps/{app_name}".format(api_token=API_TOKEN, app_name=app_name))

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

def get_results_s3path(craw_name):
    craw_resp = get_craw(craw_name)
    if craw_resp['status'] != "COMPLETED":
        return "results not ready"
    results_resp = requests.get("https://{api_token}:@api.80legs.com/v2/results/{craw_name}".format(api_token=API_TOKEN, craw_name=craw_name))
    return results_resp.json()[0]

@retry(stop_max_attempt_number=2, wait_exponential_multiplier=1000, wait_exponential_max=10000)
def download_file(url):
    local_filename = url.split('/')[-1].split('?')[0]
    r = requests.get(url, stream=True, timeout=3600)
    with open(local_filename, 'wb') as f:
        for chunk in r.iter_content(chunk_size=1024):
            if chunk: # filter out keep-alive new chunks
                f.write(chunk)
                # f.flush()
    return local_filename

def load_json_file(path):
    # data = []
    with open(path) as f:
        # for line in f:
            # d = json.loads(line)
        return json.load(f)

def fix_json(craw_l):
    craw_dl = []
    for page in craw_l:
        d = json.loads(page['result'])
        d.update({'url': page['url']})
        craw_dl.append(d)
    return craw_dl

def get_results_data(craw_name, parse_json=False):
    craw_resp = get_craw(craw_name)
    if craw_resp['status'] != "COMPLETED":
        return "results not ready"
    results_s3_path = get_results_s3path(craw_name)
    results_local_path = download_file(results_s3_path)
    craw_sl = load_json_file(results_local_path)
    if parse_json:
        return fix_json(craw_sl)
    else:
        return craw_sl
