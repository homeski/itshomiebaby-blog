Creating a MongoDB backup strategy

1. get host information

ipaddress of origin: 0.0.0.0
ipaddress of destination:  127.0.0.1

2. backup mongodb

https://docs.mongodb.com/manual/reference/program/mongodump/

```
mongodump -o /tmp/dump
```

3. setup cron job

https://www.pantz.org/software/cron/croninfo.html

```
crontab -e

18 23 * * * echo foo > /tmp/bar
```

3. 

setup host key

setup destination key

4.

```
* 23 * * * mongodump -o /tmp/dump && scp -r /tmp/dump backup@destionation:
```

