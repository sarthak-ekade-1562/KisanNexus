$baseUrl = "http://127.0.0.1:8000/api"

Write-Host "1. Testing Farmer Login..."
$farmerLogin = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -ContentType "application/json" -Body '{"email":"farmer@kisannexus.in","password":"Farmer@123"}'
$farmerToken = $farmerLogin.access_token
$farmerHeaders = @{ Authorization = "Bearer $farmerToken" }
Write-Host "   Farmer Logged In: $($farmerLogin.user.full_name)"

Write-Host "2. Getting Crops..."
$crops = Invoke-RestMethod -Uri "$baseUrl/crops" -Method Get
$onion = $crops | Where-Object { $_.name -eq "Onion" }
Write-Host "   Onion Crop ID: $($onion.id)"

Write-Host "3. Querying Mandi Prices for Onion in Nashik..."
$prices = Invoke-RestMethod -Uri "$baseUrl/market-prices?crop_id=$($onion.id)&district=Nashik" -Method Get
Write-Host "   Found $($prices.Count) price records. Top modal rate: $($prices[0].modal_price) ($($prices[0].data_status))"

Write-Host "4. Running 'Where Should I Sell?' for 50 Quintals Onion from Nashik..."
$whereBody = @{
    crop_id = $onion.id
    quantity_quintals = 50
    farmer_location = "Nashik"
    quality_grade = "Grade A"
} | ConvertTo-Json
$rec = Invoke-RestMethod -Uri "$baseUrl/recommendations/where-to-sell" -Method Post -ContentType "application/json" -Body $whereBody
Write-Host "   Best Market: $($rec.best_market.market_name)"
Write-Host "   Expected Net Return: $($rec.best_market.expected_net_return)"
Write-Host "   Why: $($rec.best_market.reasons[0])"

Write-Host "5. Checking Price Prediction and Sell Now vs Wait..."
$markets = Invoke-RestMethod -Uri "$baseUrl/markets" -Method Get
$lasalgaon = $markets | Where-Object { $_.name -like "*Lasalgaon*" }
$forecast = Invoke-RestMethod -Uri "$baseUrl/predictions/forecast?crop_id=$($onion.id)&market_id=$($lasalgaon.id)" -Method Get
Write-Host "   Forecast Modal: $($forecast.predicted_modal_price) (Confidence: $($forecast.confidence_percentage)%)"
Write-Host "   Verdict: $($forecast.recommendation)"

Write-Host "6. Farmer Creates Digital Crop Lot..."
$lotBody = @{
    crop_id = $onion.id
    quantity_quintals = 50
    quality_grade = "Grade A"
    variety = "Nashik Red Garwa"
    expected_price = 2950
    location = "Niphad Farm Yard"
    district = "Nashik"
    state = "Maharashtra"
} | ConvertTo-Json
$lot = Invoke-RestMethod -Uri "$baseUrl/lots" -Method Post -ContentType "application/json" -Headers $farmerHeaders -Body $lotBody
Write-Host "   Lot Created ID: $($lot.id), Suspicious Flag: $($lot.is_flagged_suspicious)"

Write-Host "7. Buyer Logs In..."
$buyerLogin = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -ContentType "application/json" -Body '{"email":"buyer@kisannexus.in","password":"Buyer@123"}'
$buyerToken = $buyerLogin.access_token
$buyerHeaders = @{ Authorization = "Bearer $buyerToken" }
Write-Host "   Buyer Logged In: $($buyerLogin.user.buyer_profile.company_name)"

Write-Host "8. Buyer Sends Purchase Offer on Lot..."
$offerBody = @{
    lot_id = $lot.id
    offered_price = 2900
    quantity = 50
    notes = "Prompt farm pickup with full escrow security."
} | ConvertTo-Json
$offer = Invoke-RestMethod -Uri "$baseUrl/offers" -Method Post -ContentType "application/json" -Headers $buyerHeaders -Body $offerBody
Write-Host "   Offer Created ID: $($offer.id), Offered Price: $($offer.offered_price)"

Write-Host "9. Farmer Receives Notification & Submits Counter Offer..."
$farmerNotifs = Invoke-RestMethod -Uri "$baseUrl/notifications" -Method Get -Headers $farmerHeaders
Write-Host "   Farmer unread notifications count: $($farmerNotifs.Count)"
$counterBody = @{
    counter_price = 2925
    message = "Can dispatch full 50 quintals lot at 2925."
} | ConvertTo-Json
$countered = Invoke-RestMethod -Uri "$baseUrl/offers/$($offer.id)/counter" -Method Post -ContentType "application/json" -Headers $farmerHeaders -Body $counterBody
Write-Host "   Offer Status: $($countered.status), Counter Price: $($countered.offered_price)"

Write-Host "10. Buyer Accepts Countered Offer..."
$accepted = Invoke-RestMethod -Uri "$baseUrl/offers/$($offer.id)/accept" -Method Post -Headers $buyerHeaders
Write-Host "   Offer Status: $($accepted.status)"

Write-Host "11. Verifying Transaction & Order Tracking..."
$txns = Invoke-RestMethod -Uri "$baseUrl/transactions" -Method Get -Headers $farmerHeaders
$myTxn = $txns | Where-Object { $_.offer_id -eq $offer.id }
Write-Host "   Transaction ID: $($myTxn.id), Tracking #: $($myTxn.tracking_number)"
Write-Host "   Payment Status: $($myTxn.payment_status), Order Status: $($myTxn.order_status)"
Write-Host "   Net Payout: $($myTxn.net_farmer_payout)"

Write-Host "12. Admin Inspects Transaction and Anomaly Detection..."
$adminLogin = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -ContentType "application/json" -Body '{"email":"admin@kisannexus.in","password":"Admin@123"}'
$adminToken = $adminLogin.access_token
$adminHeaders = @{ Authorization = "Bearer $adminToken" }
$adminStats = Invoke-RestMethod -Uri "$baseUrl/admin/stats" -Method Get -Headers $adminHeaders
Write-Host "   Admin Stats: Total Farmers=$($adminStats.total_farmers), Total Buyers=$($adminStats.total_buyers), Completed Trades=$($adminStats.completed_transactions)"
Write-Host "   API Data Mode: $($adminStats.api_status.data_status_mode)"

Write-Host "=== END-TO-END DEMO WORKFLOW TEST SUCCESSFUL ==="
