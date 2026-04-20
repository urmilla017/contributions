import json
from datetime import datetime, timedelta
from collections import defaultdict

with open("raw-contributions.json") as f:
    raw_data = json.load(f)

daily_counts = {item["date"]: item["count"] for item in raw_data}
dates = [datetime.strptime(d, "%Y-%m-%d") for d in daily_counts.keys()]
start_date = min(dates)
end_date = max(dates)

heatmap = []
current = start_date
while current <= end_date:
    if current.weekday() < 5:  # Monday=0, ..., Friday=4
        date_str = current.strftime("%Y-%m-%d")
        heatmap.append({"date": date_str, "count": daily_counts.get(date_str, 0)})
    current += timedelta(days=1)

monthly_totals = defaultdict(lambda: [0]*12)
for item in heatmap:
    dt = datetime.strptime(item["date"], "%Y-%m-%d")
    monthly_totals[str(dt.year)][dt.month-1] += item["count"]

busiest_month = {}
for year, counts in monthly_totals.items():
    busiest_month[year] = datetime(1900, counts.index(max(counts))+1, 1).strftime("%B")

final_data = {
    "heatmap": heatmap,
    "monthlyTotals": dict(monthly_totals),
    "busiestMonth": busiest_month
}

with open("../src/assets/contributions.json", "w") as f:
    json.dump(final_data, f, indent=2)

print("contributions.json generated!")