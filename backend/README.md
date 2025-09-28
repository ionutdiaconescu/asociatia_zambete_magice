# Backend API – Asociatia Zambete Magice

## Bază de date

- Folosește Supabase/Postgres (aceeași ca Strapi)

## Endpointuri principale

### 1. POST /api/create-checkout-session

Creează o sesiune Stripe pentru donație.

**Request Body:**

```json
{
  "amount": 50,
  "donorEmail": "test@email.com",
  "donorName": "Ion Popescu",
  "campaignId": 1
}
```

**Response:**

```json
{
  "url": "https://checkout.stripe.com/pay/cs_test_..."
}
```

### 2. GET /api/stats

Returnează total donații și progresul campaniilor.

**Response:**

```json
{
  "totalDonations": 1500,
  "campaigns": [
    {
      "id": 1,
      "title": "Campanie 1",
      "goal": 2000,
      "raised": 500,
      "progress": 25
    },
    {
      "id": 2,
      "title": "Campanie 2",
      "goal": 1000,
      "raised": 1000,
      "progress": 100
    }
  ]
}
```

## Testare

- Recomandat: Thunder Client (VS Code) sau Postman
- Serverul rulează pe `http://localhost:3001`

## Configurare

- Cheia Stripe se pune în `.env` la `STRIPE_SECRET_KEY`
- Conexiunea la baza de date se configurează în `.env` la `DATABASE_URL`

---

Pentru întrebări sau extinderi, vezi codul sursă sau contactează administratorul proiectului.
