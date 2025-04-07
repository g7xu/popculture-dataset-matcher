# Trend Bubble 🫧🫧🫧

This is a project that was constructed within 24hrs of timeframe during UCSD DS3 2025 DataHackathon. Checkout My Hackathon submission [here](https://devpost.com/software/trend-bubble?ref_content=my-projects-tab&ref_feature=my_projects)

> *If datasets are culture’s footprints, we just built a radar to track where it’s going. It is a dashboard that tracks the change in the popularity of datasets.*

---
## 📁 Project Structure
```
trend-bubble/
│
├── data/                # Cleaned JSON files updated daily
├── js/                  # javascript
├── .github/workflows/   # GitHub Actions for automation
├── index.html           # Main dashboard
├── fecth_kaggle.py      # data fetching script
├── agg_data.py          # data aggregation script
├── ai_categorization.py # data categorization script
└── README.md

```
---
## ✨ Inspiration

The inspiration for Trend Bubble came from a simple, recurring frustration: trying to find an interesting dataset often means scrolling endlessly through Kaggle or Google without direction. Most users rely on static metrics like download counts or votes, but those don’t reflect what’s actually gaining attention right now. Meanwhile, pop culture is fast-moving and ever-changing — from viral TikTok trends to breaking news in sports and entertainment.  

We asked ourselves: can we use dataset activity to reflect the cultural zeitgeist in real time? That’s how **Trend Bubble** was born — a visualization that captures the pulse of pop culture by analyzing trending datasets on Kaggle.

---
## 🧠 What It Does

**Trend Bubble** is a single-page, interactive dashboard that visualizes the current landscape of Kaggle’s most popular dataset categories.

- 🟣 **Bubble Chart**: Each circle represents a cultural category (like “Music”, “Gaming”, or “Fashion”), sized by its proportion in today’s trending datasets.
- 📈 **Line Chart**: Tracks how interest in each category shifts over time.
- 🔁 **Auto-updates daily** — no refresh needed.
---
## 🛠 How We Built It

- **Backend**: Uses the Kaggle API to fetch trending dataset metadata daily.
- **Tag Cleaning**: Called Google Gemini Flesh 2.0 API to clean up the tags
- **Data Pipeline**: Automated via **GitHub Actions**, which pushes updates to the repository every 24 hours.
- **Frontend**: Built using **D3.js** for scalable, interactive visualizations.
- **Deployment**: Hosted on **GitHub Pages** for zero-cost, instant access.

---
## 🙏 Acknowledgements
- Kaggle for providing the API and dataset infrastructure
- D3.js for the visualization toolkit
Google Gemini for the AI-powered tag cleaning
- UCSD DS3 for hosting the DataHackathon