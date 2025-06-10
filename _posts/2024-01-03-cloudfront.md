---
layout: post
title: Increasing Cache Hit Ratio on AWS CloudFront for Dynamic Content
description: A quick look at how we can configure AWS's CDN CloudFront to increase the cache hit ratio.
date:   2024-01-03 16:00:00
cover: cache.jfif
image: /images/cache.jfif
categories: posts
tags: aws cloud
---

> "A picture of a caching system working well. Efficiency, green and speed"

When configured correctly, AWS CloudFront can be used to reduce compute required to serve requests. To increase the efficiency (cache hit ratio) of CloudFront, let's review its configuration.

## What Is a Cache Hit Ratio?

A cache hit ratio indicates which proportion of requests are served from a cache (cache hit), rather than the origin (cache miss). For example, if 10 requests are made, and 3 are served by the cache, we have a cache hit ratio of 30%. 

According to [CloudFlare](https://www.cloudflare.com/en-gb/learning/cdn/what-is-a-cache-hit-ratio/), The cache hit ratio of a static website can easily be 95%+, but dynamic content will likely decrease this figure.

Dynamic content decreases the cache hit ratio because each request will need to be personalised to the requester. For example, a news article could be cached and served to many people as it is static, but somebody's email inbox can only be served to that person. So 100 requests from different people to the news article can be served with 1 cache miss (to the origin) and 99 cache hits (a 99% cache hit ratio). 100 requests from different people to their inboxes must be served with 100 cache misses (0% cache hit ratio). This is an extreme example, and in reality requesting an email inbox would actually include a few static attributes, such as the stylesheet used to format the page. 

## Cookie Values

If CloudFront is configured to use cookies to cache, you can specify which cookies should be respected by the cache, and which should be ignored. For example, if a page is only influenced by one of three cookies which are included in a request, we should only cache in respect to this key, and ignore the others. 

We can also only forward cookies for dynamic content, and ignore all cookies for static content (such as stylesheets or scripts). This can be achieved by configuring separate cache behaviour. We can also create another cache behaviour for when cookie values are unique for each user, and for when the content is dependent on less values.

## Increase the TTL of the cache
If you have control over the content that you're serving, you can cache static assets for (very) long periods.
The [BBC set a maximum age of their static assets to a year](https://www.creativebloq.com/how-to/cache-in-on-the-bbcs-performance-booster#:~:text=At%20the%20BBC%20we%20send%20all%20static%20assets%20with%20a%20maximum%20age%20of%2031%2C536%2C000%20seconds%20set%20in%20the%20cache%20header.), meaning that assets only need to be requested once for a whole year. This of course means that any updates would need to wait up to a year to appear to users, so they use new URLs for updated assets. This trick is limited to scenarios where we have control over how assets are stored and served to the user. 

## Query Parameters

The cache hit rate can be increased by only forwarding the parameters that will return unique objects. In other words, if a parameter doesn't affect the object, then it should be ignored. CloudFront is also **case-sensitive** to the parameters, so `param=a` will be treated unique to `param=A`. If you have control over the application, ensure that the same case is being used for all requests. 

The same order should also be used, as CloudFront is sensitive to this too. `param1=a&param2=b` is treated as different to `param1=b&param2=a`. 


## Request Headers

If CloudFront is configured to cache based on headers, you can select which headers are ignored when caching. All headers will still be forwarded to the origin, but they will be ignored during the caching process. Headers with many possible values should be avoided where possible, and should be replaced with more general headers. For example, instead of caching based on the specific device-type header, we can instead use `CloudFront-Is-Mobile-Viewer` and `CloudFront-Is-Desktop-Viewer`.

## Using CloudFront Origin Shield

This approach seems to lack much nuance, but adding another caching layer between CloudFront and the origin can increase the cache hit ratio. This can reduce load on the origin, and is likely to be be most effective for scenarios where requests are being made from many geographic locations.

## Further Reading
https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/cache-hit-ratio.html
https://www.creativebloq.com/how-to/cache-in-on-the-bbcs-performance-booster
https://www.cloudflare.com/en-gb/learning/cdn/what-is-a-cache-hit-ratio/
