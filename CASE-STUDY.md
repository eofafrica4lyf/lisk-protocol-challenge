# Case Study/Approach

## My Implementation
Going first by way of brute force, I basically ran a loop to create n requests to get block height for each block within the last n range. It worked fine for n=1000, but times out when n= 10,000. Bearing in mind that n has the possibility of being substantially greater than 10,000, this approach was quickly dumped.

Next, I tried the idea of batching up promises to run parallel requests. For example, for n=1000, I could use a divisor of 1000, like 50 for example, and batch requests in 50’s. In each batch of 50, I would also run 50 parallel requests.
If h is the height of the latest block, one batch would include the 1st(which is the latest block, h) down to the 49th block(h - 49), the second batch would include the (h - 50)th block down to the (h - 99)th block and so on. Then another function ran each batched request and took each 50 block heights specified, created an array of Promises and ran a Promise.all on them all.
On the overall, the aim was to also run a Promise.all on all the promises corresponding to each batch of 50 individual requests, aggregate and calculate the results, and cache. Again, this started to be unreliable about n=4000. n=10,000 didn’t work out with this approach.

Bearing in mind sometimes, one job was not even completed before the next one fired, there had to be some other way, also all the jobs kept failing.

I thought the last approach failed because it meant that the Lisk Core API didn’t have enough bandwidth to support n=4000 requests at a time, or maybe a rate limiting mechanism in place. Batching the requests into “promises of promises” meant that the requests were likely to hit the API at approximately the same time. Maybe what I could have done was try to introduce a small delay between each batch of promises, but that wasn’t feasible since I was also doing a Promise.all on all the batches.

At this point, async-awaiting each batch proved to the solution because it introduced the necessary delay that needed to be between each batch - awaiting each batch would take some little time which is equivalent to the sum of the time the API needed to send a response plus the time it took the data to be downloaded. This meant that a slow network could pose an unnecessarily longer delay (most times, this would actually be negligible enough). 

I was right. This proved to work when each job was run i.e. batching 10,000 requests in 1000s and awaiting each batch.



But of course, n can be much than 10000. What happened when n >> 10,000?

At this point, the job should not be even be running every minute. This is because it would take several minutes for one job to be completed. Running n>20,000, for example took more than 3 minutes to finish up.  I made the following observations:
- The next jobs had already been fired while the current job was still running for n>20000, so the runtime was basically switching between running each process causing a slow response . So I did n=100,000 in batches of 1000, while also reducing the frequency of the job to 5 minutes instead of 1 minute. This time, job was much faster and completed in time (< 6minutes).
- When I ran n=50,000 in batches of 2000, the job tended to fail more. This confirmed my bandwidth suspicion. It was more reliable to run in batches of 1000 than using 2000. Also, it could have been my network’s speed and bandwidth.


## Enhancements?
What if n was even much more: running into millions. There would be much longer time between jobs but I believe the jobs should still run. The data would be quite stale however because of the time it would take each job to run. Running jobs of n=10,000,000 could easily mean the data pulled from Redis is always an hour stale or more. So a balance definitely has to be found between the freshness of the retrieved data and the size of ’n’.


A better but controversial approach would be Off-chaining.

Off-chaining the data will help us save on-chain data away from the blockchain. In our case, an ideal database to use could be a SQL (using Redis is also possible) database where each block’s data can be saved on a single including the number of transactions and the total transfer value of all the transactions, and the height (which could also be the id). It is easy at this point to calculate the average transfer value for the last n>>>10,000 blocks using an SQL query. 
A job could be run to records of old blocks which are too far back in time using the heights, if necessary.

Off-chaining however poses a major issue. The data we retrieve is no more immutable, any value in the database can be changed by anyone with enough access, whether legal or not.