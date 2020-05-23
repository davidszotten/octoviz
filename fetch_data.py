from datetime import datetime, timezone
import os

import requests
import sqlite_utils

MPAN = os.environ['MPAN']
SERIAL_NUMBER = os.environ["SERIAL_NUMBER"]
PRODUCT_CODE = os.environ["PRODUCT_CODE"]

API_KEY = os.environ["OCTOPUS_API_KEY"]
BASE_URL = "https://api.octopus.energy"
TARIFF_CODE = f"E-1R-{PRODUCT_CODE}-A"
# fetch a large chunk in case it's been a while since last time
# still seems to respond pretty fast at 2k
PAGE_SIZE = 2000

CONSUMPTION_URL = (
    f"{BASE_URL}/v1/electricity-meter-points/"
    f"{MPAN}/meters/{SERIAL_NUMBER}/consumption/?page_size={PAGE_SIZE}"
)
RATES_URL = (
    f"{BASE_URL}/v1/products/{PRODUCT_CODE}/"
    f"electricity-tariffs/{TARIFF_CODE}/standard-unit-rates/?page_size={PAGE_SIZE}"
)


def as_utc(dt_string):
    dt_local = datetime.fromisoformat(dt_string)
    dt_utc = dt_local.astimezone(timezone.utc)
    utc_string = dt_utc.isoformat()
    return utc_string


def main():
    get_rates()
    get_consumption()


def get_consumption():
    db = sqlite_utils.Database("octopus.db")
    response = requests.get(CONSUMPTION_URL, auth=(API_KEY, ""))
    response.raise_for_status()
    results = response.json()["results"]
    converted = results.copy()
    for row in converted:
        for key in ["interval_start", "interval_end"]:
            row[key] = as_utc(row[key])
    db["consumption"].insert_all(converted, pk="interval_start", replace=True)


def get_rates():
    db = sqlite_utils.Database("octopus.db")
    response = requests.get(RATES_URL, auth=(API_KEY, ""))
    response.raise_for_status()
    results = response.json()["results"]
    converted = results.copy()
    for row in converted:
        for key in ["valid_from", "valid_to"]:
            # fromisoformat doesn't like 'Z'
            row[key] = as_utc(row[key].replace('Z', '+00:00'))
    db["rates"].insert_all(converted, pk="valid_from", replace=True)


if __name__ == "__main__":
    main()
