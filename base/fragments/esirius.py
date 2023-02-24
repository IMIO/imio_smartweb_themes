import requests


def message(self):
    if "smartweb.esirius_apikey" not in context.portal_registry:
        return ""
    self.request.response.setHeader("Cache-Control", "no-cache")
    esirius_apikey = context.portal_registry["smartweb.esirius_apikey"]
    response = requests.get(
        f"https://passerelle-braine-l-alleud.test.entrouvert.org/esirius-swi/prod/get_all_indicators?apikey={esirius_apikey}")
    data = response.json()
    if data.get("data") is None:
        return ""
    if data.get("data")[0].get("closed") is True:
        return "closed"
    # str au format "HH:MM:SS"
    time = data.get("data")[0].get("estimatedAvgWaitingTime")
    if time == "-":
        # Same as closed is True?
        value = "<span class=\"value\">--</span>"
        unit = "<span class=\"unit\">minute</span>"
        return "{}{}".format(value, unit)
    hours, minutes, seconds = time.split(":")
    seconds = int(seconds)
    hours = int(hours) * 60
    minutes = int(minutes) + 1 if seconds > 1 else int(minutes)
    time = hours + minutes
    value = "<span class=\"value\">{}</span>".format(time)
    unit = "<span class=\"unit\">minute{}</span>".format("s" if time > 1 else "")
    return "{}{}".format(value, unit)
