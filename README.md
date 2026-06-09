# Meltwater Technical Exercise

The different parts of this technical assessment are located in their respective branches.

If you would like to review the solution for a specific part, please switch to the corresponding branch:

```bash
git switch <branch-name>
```

Then run:

```bash
pnpm start
```

to execute the solution for that part.

## DEMO

To run the demo, you will need to:

```bash
docker compose up -d #this will dowload images and start containers in order to run the demo
pnpm install #install dependencies
pnpm start #run the demo
```

Once you have the demo running, you can access request the API via the following endpoints:

```bash
# To redact a document
curl --location 'http://localhost:3000/v1/meltwater/encrypt' \
--header 'Content-Type: application/json' \
--data '{
    "document":"SPYXFAMILY - La nueva Mision de Bondman y el Agente Twilight alias Loid Forger alias Agente Papi. Para esta mision el Twilight y Thorn Princess alias Yor Forger alias Agente Mami deberan rescatar a la agente Anya siguendo las ordenes de Bondman",
    "keywords":"Bondman Twilight,'\''Loid Forger'\'','\''Agente Papi'\'','\''Yor Forger'\'','\''Agente Mami'\'','\''Thorn Princess'\'' Anya"
}
'

# To unredact a document
curl --location 'http://localhost:3000/v1/meltwater/decrypt' \
--header 'Content-Type: application/json' \
--data '{
    "document": "SPYXFAMILY - La nueva Mision de XXXXXXXX y el Agente XXXXXX alias XXXXXXX alias XXXXXXXXX. Para esta mision el XXXXXX y XXXXXXX alias XXXX alias XXXXXXX deberan rescatar a la agente XXXXXXX siguendo las ordenes de XXXXXXX",
    "key": "SFdeVVlUZFBKXmRaM0d0c2lyZnMpWXxucW5sbXkpUXRuaTJLdHdsancpRmxqc3lqMlVmdW4pWXxucW5sbXkpWW10d3MyVXduc2hqeHgpXnR3Mkt0d2xqdylGbGpzeWoyUmZybilGc35mKUd0c2lyZnMzKUpzaHd+dXlqaTJSanh4ZmxqKQ=="
}'

# To search using redact keywords
curl --location 'http://localhost:3000/v1/meltwater?keyword=Bondman'
```
