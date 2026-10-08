#!/usr/bin/env sh
# Smoke test of the demonstration profile: builds the image, starts the stack and
# checks what issue #13 promises. Run from the repository root with a .env file.
set -eu

compose="docker compose --profile demo"
url="http://127.0.0.1:${APP_PORT:-3000}/api/health"
cleanup() { $compose down --volumes --remove-orphans >/dev/null 2>&1 || true; }
trap cleanup EXIT

echo "1. The stack starts and becomes healthy"
$compose up --build --detach --wait

echo "2. The health endpoint reports the application and the database"
body=$(curl --silent --show-error --fail "$url")
echo "   $body"
[ "$body" = '{"status":"ok","checks":{"app":"ok","database":"ok"}}' ]

echo "3. The application does not run as root"
uid=$($compose exec -T app id -u)
echo "   uid=$uid"
[ "$uid" != "0" ]

echo "4. The database is not published on the host"
published=$($compose port db 5432 2>/dev/null || true)
echo "   published=${published:-none}"
# Compose prints ":0" for a port that is not published.
[ -z "$published" ] || [ "$published" = ":0" ]

echo "5. The demonstration catalogue is loaded by the setup task"
products=$($compose exec -T db sh -c 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -tAc "select count(*) from products"')
echo "   products=$products"
[ "$products" = "9" ]

echo "6. The health endpoint answers 503 when the database is down"
$compose stop db >/dev/null
status=$(curl --silent --output /dev/null --write-out '%{http_code}' "$url")
echo "   status=$status"
[ "$status" = "503" ]

echo "7. The application refuses to start without its configuration and names the variable"
image=$($compose images --quiet app | head -n 1)
output=$(docker run --rm -e APP_URL=http://localhost:3000 "$image" 2>&1) && {
  echo "   expected a non-zero exit"; exit 1; }
echo "$output" | sed 's/^/   /'
echo "$output" | grep -q "DATABASE_URL is missing"

echo "All checks passed"
