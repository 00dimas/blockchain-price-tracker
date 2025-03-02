# Blockchain Price Tracker

## Overview
Blockchain Price Tracker API is a system for monitoring Ethereum & Polygon prices, sending price increase alerts, and calculating ETH → BTC swaps.  
This API uses Nest.js, TypeORM, PostgreSQL, Moralis API, and Nodemailer for email notifications.

## Features
- Cron Job: Updates Ethereum & Polygon prices every 5 minutes in the database.
- Email Alert: Sends an email if the price increases by more than 3% in the last hour.
- Swap ETH → BTC: Calculates how much BTC can be received with a 3% fee.
- Swagger UI: API documentation available at http://localhost:3000/api/docs.
- Swagger UI Image:

    ![Swagger UI](https://i.postimg.cc/d17nGx3p/image.png)

## Installation & Setup

### Requirements
Ensure you have:
- Docker & Docker Compose (for easy deployment)
- Moralis API Key (required to fetch crypto prices)
- SMTP Configuration (for email notifications)

### Clone the Repository
```sh
git clone https://github.com/your-repo/blockchain-price-tracker.git
cd blockchain-price-tracker
```

### Setup Environment Variables
Copy .env.sample to .env and fill in the required configuration:
```sh
cp .env.sample .env
```

Edit the .env file with the following configuration:
```ini
# Database Configuration
DATABASE_URL=postgresql://user:password@db:65432/blockchain
PORT=3000

# Email SMTP Configuration
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
SMTP_FROM=

# Alert Email
ALERT_EMAIL=

# Moralis API Key
MORALIS_API_KEY=
```

Ensure you provide a valid MORALIS_API_KEY and SMTP configuration for email functionality.

### Run with Docker (Recommended)
```sh
docker-compose up --build
```

Docker Compose UI Image:

![Docker Compose UI](https://i.postimg.cc/vH7h798Y/image.png)

The application will be available at http://localhost:3000

## API Endpoints

### Prices
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /prices | Save the latest price data into the database |
| GET | /prices | Get the latest 24-hour price history |
| GET | /prices/history | Get hourly price data for the last 24 hours |
| POST | /prices/alert | Set a price alert; an email is sent when the target price is reached |
| POST | /prices/send-price-email | Send an email with the latest price |

### Swap
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /swap/rate?ethAmount=1 | Calculate how much BTC can be received when swapping ETH |

Full API documentation is available at http://localhost:3000/api/docs (Swagger UI).

## How It Works

### Price Cron Job (Every 5 Minutes)
1. Every 5 minutes, the API fetches Ethereum & Polygon prices from Moralis API.
2. The price data is stored in the database.
3. If the price increases by more than 3% within the last hour, an alert email is sent to ALERT_EMAIL.

### Price Alert
1. Users can set a price alert via /prices/alert.
2. If the price reaches or exceeds the threshold, an email is automatically sent.
3. The alert is removed after execution.

### Swap ETH → BTC
1. Users provide an ETH amount via /swap/rate?ethAmount=1.
2. The API calculates the BTC amount received after deducting a 3% fee.
3. The API response includes:
```json
   {
     "btcEquivalent": 0.0259682464,
     "feeBtc": 0.0007790473,
     "finalAmountBtc": 0.0251891990,
     "feeEth": 0.03,
     "feeUsd": 66.83,
     "ethPrice": 2227.88,
     "btcPrice": 85792.64,
     "feePercentage": 0.03
   }
```

## Development & Debugging

### Check Cron Job Logs
```sh
docker logs <container_id> | grep "Fetching prices from Moralis..."
```

### Check Database
Access the database container and run:
```sh
docker exec -it <database_container> psql -U user -d blockchain
SELECT * FROM prices ORDER BY created_at DESC;
```

### Check Email Logs
If emails are not sent, check logs with:
```sh
docker logs <container_id> | grep "Failed to send email"
```