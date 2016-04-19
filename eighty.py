import os
from dateutil.parser import parse as dateparse
import datetime
import time
import json
import requests

# see: http://datafiniti.github.io/80docs/?python
API_TOKEN = os.environ["EIGHTYLEGS_API"]

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
    requests.delete("https://{api_token}:@api.80legs.com/v2/urllists/{url_name}".format(api_token=API_TOKEN, url_name=url_name))
    print("Deleted EightyUrl: {name}".format(name=url_name))

def list_apps():
    response = requests.get("https://{api_token}:@api.80legs.com/v2/apps".format(api_token=API_TOKEN))
    return response.json()

def create_app(app_name, file_path):
    url = "https://{api_token}:@api.80legs.com/v2/apps/{app_name}".format(api_token=API_TOKEN, app_name=app_name)
    file = {"file": open(file_path, "rb")}
    headers = {"content-type": "application/octet-stream"}
    requests.put(url, files=file, headers=headers)
    print("Created EightyApp: {name}".format(name=app_name))

def delete_app(app_name):
    requests.delete("https://{api_token}:@api.80legs.com/v2/apps/{app_name}".format(api_token=API_TOKEN, app_name=app_name))
    print("Deleted EightyApp: {name}".format(name=app_name))

def list_craws():
    response = requests.get("https://{api_token}:@api.80legs.com/v2/crawls".format(api_token=API_TOKEN))
    return response.json()

def create_craw(craw_name, payload):
    url = "https://{api_token}:@api.80legs.com/v2/crawls/{craw_name}".format(api_token=API_TOKEN, craw_name=craw_name)
    headers = {"content-type": "application/json"}
    requests.post(url, data=json.dumps(payload), headers=headers)
    print("Created EightyCraw: {name}".format(name=craw_name))

def kill_craw(craw_name):
    requests.delete("https://{api_token}:@api.80legs.com/v2/crawls/{craw_name}".format(api_token=API_TOKEN, craw_name=craw_name))
    print("Killed EightyCraw: {name}".format(name=craw_name))

def get_craw(craw_name):
    response = requests.get("https://{api_token}:@api.80legs.com/v2/crawls/{craw_name}".format(api_token=API_TOKEN, craw_name=craw_name))
    return response.json()

def list_fix_craws(days_ago=14):
    craw_raw = list_craws()
    # filter most recent days_ago
    last_day = datetime.datetime.now() - datetime.timedelta(days=days_ago)
    craw_l = [ craw for craw in craw_raw if dateparse(craw['date_created']) > last_day ]
    fcraw = []
    for craw in craw_l:
        # remove fields
        for key in ['user','user_agent','data','id','app','depth','max_depth']:
            craw.pop(key)
        # parse timestamps 
        craw['date_created'] = dateparse(craw['date_created']).isoformat()
        if craw['date_started'] != '':
            craw['date_started'] = dateparse(craw['date_started']).isoformat()
        if craw['date_completed'] != '':
            craw['date_completed'] = dateparse(craw['date_completed']).isoformat()
        craw['urls_pct_compleat'] = craw['urls_crawled'] / craw['max_urls']
        # elasped time craw-state metrics
        td = elasped_time(craw)
        craw = {**td, **craw}
        fcraw.append(craw)
    return fcraw

def elasped_time(craw_d):
    td = {}
    td['elasped_now'] = delta_hours(datetime.datetime.utcnow() - dateparse(craw_d['date_created']))
    if craw_d['date_completed'] != '':
        td['elasped_full'] = delta_hours(dateparse(craw_d['date_completed']) - dateparse(craw_d['date_created']))
    if craw_d['date_started'] != '':
        if craw_d['date_completed'] != '':
            td['elasped_running'] = delta_hours(dateparse(craw_d['date_completed']) - dateparse(craw_d['date_started']))
        else:
            td['elasped_running'] = delta_hours(datetime.datetime.utcnow() - dateparse(craw_d['date_started']))
    if craw_d['date_started'] != '':
        td['elasped_queued'] = delta_hours(dateparse(craw_d['date_started']) - dateparse(craw_d['date_created']))
    return td

def delta_hours(elasped_time):
    return round(elasped_time / datetime.timedelta(hours=1), 3)

def list_grouped_craws(days_ago=7):
    fcraw = list_fix_craws(days_ago)
    gcraw = {}
    gcraw['started'] = filter_dl(fcraw, field='status', value='STARTED')
    gcraw['compleated'] = filter_dl(fcraw, field='status', value='COMPLETED')
    gcraw['queued'] = filter_dl(fcraw, field='status', value='QUEUED')
    gcraw['canceled'] = filter_dl(fcraw, field='status', value='CANCELED')
    return gcraw

def filter_dl(dl, field, value, test='eq', value2=None):
    if test=='eq':
        return [ craw for craw in dl if craw[field] == value ]
    elif test=='not':
        return [ craw for craw in dl if craw[field] != value ]        
    elif test=='gt':
        return [ craw for craw in dl if craw[field] > value ]
    elif test=='lt':
        return [ craw for craw in dl if craw[field] <  value ]
    elif test=='bw':        
        return [ craw for craw in dl if craw[field] >= value and craw[field] < value2 ]

def get_craw_s3path(craw_name): 
    results_resp = requests.get("https://{api_token}:@api.80legs.com/v2/results/{craw_name}".format(
        api_token=API_TOKEN, craw_name=craw_name))
    results_resp.raise_for_status()
    return results_resp.json()[0]

def download_craw_eighty(url):
    local_filename = url.split('/')[-1].split('?')[0]
    print("Downloading EightyAPI Craw Data: {name}".format(name=local_filename))
    resp = requests.get(url, stream=True, timeout=3600)
    with open(local_filename, 'wb') as file:
        for chunk in resp.iter_content(chunk_size=1024):
            if chunk:
                file.write(chunk)
                # file.flush()
    return local_filename

def fix_json(craw_l):
    craw_dl = []
    for page in craw_l:
        if 'result' in page:
            d = json.loads(page['result'])
            d.update({'url': page['url']})
            craw_dl.append(d)
    return craw_dl

def stuck_craw_filter(craw):
    if (craw['status'] == 'STARTED') and \
        (craw['elasped_running'] >= 24):
        return True
    elif (craw['status'] == 'STARTED') and \
        (craw['elasped_running'] >= 8) and \
        (craw['urls_pct_compleat'] >= 0.9):
        return True
    elif (craw['status'] == 'STARTED') and \
        (craw['elasped_running'] >= 8) and \
        (craw['urls_pct_compleat'] < 0.1):
        return True
    elif (craw['status'] == 'STARTED') and \
        (craw['elasped_running'] >= 12) and \
        (craw['urls_pct_compleat'] >= 0.8):
        return True
    elif (craw['status'] == 'STARTED') and \
        craw['date_completed'] and \
        craw['elasped_running'] < 0:
        return True
    else:
        return False

def done_craw_filter(craw):
    seven_days_ago = datetime.datetime.now() - datetime.timedelta(days=7)
    if craw['status'] == 'COMPLETED' and \
        craw['date_completed'] and \
        (dateparse(craw['date_completed']) > seven_days_ago) and \
        (craw['urls_crawled'] >= 5000):
        return True
    elif (craw['status'] == 'CANCELED') and \
        (craw['urls_crawled'] >=  5000):
        return True
    else:
        return False

def find_craws(type='stuck', days_ago=14):
    craw_l = list_fix_craws(days_ago)
    if type == 'stuck':
        return list(filter(stuck_craw_filter, craw_l))
    elif type == 'done':
        return list(filter(done_craw_filter, craw_l))
