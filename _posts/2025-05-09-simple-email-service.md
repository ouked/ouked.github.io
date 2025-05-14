---
layout: post
title: "Escaping the SES Sandbox: An Adventure in Sunk Costs"
description: A light-hearted review of why I got rejected from SES production access.
image: 
cover: ses.png
date: 2025-05-09
categories: posts
tags: aws cloud
---

> **Update 14/05/2025**
>
> AWS have approved production SES for my account! [More information after the conclusion](#update---14052025).

## Table of Contents
- [Table of Contents](#table-of-contents)
- [Why use Emails for User Interface?](#why-use-emails-for-user-interface)
  - [Onboarding](#onboarding)
  - [Continued Usage](#continued-usage)
  - [Long-term](#long-term)
  - [Drawbacks](#drawbacks)
- [Getting access to SES](#getting-access-to-ses)
- [Making AWS happy](#making-aws-happy)
  - ["Best practices for sending email using Amazon SES" - A developer guide by Amazon Web Services](#best-practices-for-sending-email-using-amazon-ses---a-developer-guide-by-amazon-web-services)
    - [Success Metrics](#success-metrics)
      - [Bounces](#bounces)
      - [Complaints](#complaints)
      - [Message Quality](#message-quality)
      - [Takeaways](#takeaways)
    - [Maintaining a positive sender reputation](#maintaining-a-positive-sender-reputation)
      - [Takeaways](#takeaways-1)
  - [The wider internet](#the-wider-internet)
    - [On Reddit](#on-reddit)
    - [Elsewhere](#elsewhere)
    - [Takeaways](#takeaways-2)
- [My response](#my-response)
- [Conclusion](#conclusion)
- [Update - 14/05/2025](#update---14052025)
- [Appendix](#appendix)
  - [Terms of Service](#terms-of-service)
  - [Privacy Policy](#privacy-policy)

I've been working on a personal project recently, and it relies on email for user interface. This post outlines why I have chosen to use emails, the Simple Email Service application process, and how I changed my request to hopefully gain Simple Email Service Production Access.

# Why use Emails for User Interface? 

Email isn't the perfect tool for user interface: it provides no hints to the user on what information is needed, it can't validate input on the client-side, and it's a bit... weird. We have apps and websites to do this, so why make things harder? 

While Email has its flaws, I believe in the correct scenario, it actually can be a great user interface.

## Onboarding

If I'm telling a friend or family member (hereafter affectionately referred to as "the user") about a project, they often want to see it and try it for themselves. They've already been kind enough to show interest in my idea, so I want to make it as easy as possible to get them using it as quickly as possible. 

I don't want to have to make them install an app, as I will have had to have both gone through the process of writing and publishing an app that meets the App Store / Play store's requirements of quality, and they will have to search for the app, look through the 100s other apps with similar names, and then wait for it to install.

I don't want to have to make go to a website, as they will have to type in an odd URL with a subdomain, and then authenticate somehow. I now have to deal with user accounts, passwords, sessions, and they have to remember (or forget!) yet another password. I could not use logins, but now anybody on the internet can access and upload anything to my S3 buckets.

Of course, I am being reductive here but in the case where my needs are...

- Trusted Users only
- Not dealing with passwords, databases, sessions, etc
- Easy for the user to get started 
- Simple data input (text, photos)
- Easy for me to implement

... emails are really useful!

If somebody wants to try my project, all they have to do is email an address that I've given them. On the backend, we check that the sender's email address is on a list of approved users (yes, this needs to be manually written and maintained), process the data they sent, and then send them back an email with the results. We rely on their email provider's authentication process, and get to deal with only the requests that get sent to us.

## Continued Usage

If the user wants another go, they can either look in their "Sent" folder in their mail app, or could use the auto-complete feature that a lot of email apps have for addresses you've used before. 

## Long-term

If my project breaks or ceases to exist in the future, the users still have all data they input and output.

## Drawbacks

As mentioned before, it's not the perfect solution. Users need to send to the right address and send data in the correct format. We're also restricted by the form of email - there is no customisable input, no instant feedback, and we have to deal with email clients. However, in the case of my current project (and many others) of "user uploads some data, it gets processed, they get something back", email is adequate.

The other drawback is how we receive and send mail. Instead of managing an SMTP server, I am using Amazon's Simple Email Service (SES), which, true to its name, was surprisingly easy to setup. Of course, using a managed service comes with its costs: $0.10/1000 sent emails, and $0.10/1000 received mails (+ $0.09 for every 1000 incoming email chunks). This is expensive at scale, but I would be very happy to pay 7.5p for 1000 people to try out my project. 

You also need to be allowed to use SES...

# Getting access to SES

While testing, you can verify your own email for testing. You can send mail to and from this mail address and it's very easy. However, to allow an unverified address to send / receive mail to this address, you need to apply to SES Production Access.

You send a request to AWS Support, they review your case, and then they give you access. I thought that due to my extremely limited target audience (people I know personally), it would be a quick and easy process. I send off a casual message, and expect it to be approved in a couple days.

For reference, here is my message:

> Hi
>
> First, thanks for reviewing my case.
>
> I'm working on a small personal project which allows users to upload their
> images and view a journey map from the image locations in a front end
> written in React. To upload their images, they email 
> "[REDACTED]" with their photos and potentially some extra
> data, which triggers a chain of events ending with a JSON file that
> describes their journey from photo. This is a small project and for both
> maintainability and cost, I want this to only be available to emails on an
> allow list, which I maintain personally. Once processing is finished, I
> want to be able to send a confirmation email with a link to my frontend.
>
> Because of this design, users will only receive an email if they have first
> sent an email to the service, so will be expecting an email back. Emails
> will not be sent unprompted. I include my personal email address in each
> email I send the users, inviting feedback, so if they do want to
> unsubscribe (which would in fact mean they block themselves from the
> service), I can remove their email from my allowed email list, so they
> won't be able to create journeys, and thus won't receive notification
> emails. Bounced emails etc won't be resent, and I will check logs to see
> when this happens.
>
> So in short - this is a small friends-only project where emails that are
> sent will only ever be sent in reply to an email from the instigating
> address. These addresses will be limited to those that I know personally,
> and they are invited to reach out with feedback to my personal email
> address.
>
> Thank you once more for reviewing my case, and I will include my current
> draft below.
>
> Alex
>
> ---
>
> <generic draft giving the user a link to the created map>

To AWS' credit, their response was quite prompt. It took 2 days, and they rejected me. So now I need to figure out why my use case was rejected, and attempt to remediate these issues. 

Their response:

> Hello,
>
> Thank you for providing us with additional information regarding your sending limits. We are unable to grant your request at this time.
>
> We reviewed your request and determined that your use of Amazon SES could have a negative impact on our service. We are denying this request to prevent other Amazon SES customers from experiencing interruptions in service.
>
> For security purposes, we are unable to provide specific details.
>
> For more information about our policies, please review the AWS Acceptable Use Policy ( http://aws.amazon.com/aup/  ) and AWS Service Terms ( http://aws.amazon.com/serviceterms/  ).
>
> Thank you for contacting Amazon Web Services.
>
> We value your feedback. Please share your experience by rating this and other correspondences in the AWS Support Center. You can rate a correspondence by selecting the stars in the top right corner of the correspondence.
>
> Best regards,
> Trust and Safety

# Making AWS happy

Understanding now that this is not a simple check-box process, I researched what AWS recognises as acceptable use of SES, and what my application may be missing. Their policy of not including their specific reasons requires a bit of detective work.

Asking everybody's favourite probably-not-conscious AI assistant prompted the following:

> Your justification is thoughtful and well-written—it clearly explains the context, user interaction, and limitations. However, AWS SES rejections often hinge on compliance clarity and anti-abuse assurances, and your current request may lack a few keywords and formal signals they look for.
> 
> Here’s how to improve your justification for a higher chance of approval:
> 
> **Key Areas to Improve**:
> 1. Explicit mention of opt-in and unsubscribe processes:
>   - AWS wants confirmation that you're following email best practices.
>   - Even though it’s friends-only, AWS still expects clear unsubscribe handling and consent.
> 
> 2. Use of formal tone and terminology:
>   - Terms like "transactional email," "opt-in," "unsubscribe process," and "anti-spam compliance" should appear explicitly.
>
> 3. Clear SES usage scope: 
> - Clarify that you’ll only use SES for transactional notifications, not marketing or bulk sends.

Aside from the much appreciated compliment for the quality of my writing, this response highlights the importance of keywords, and the idea of following email best-practices. But how will I know what AWS deems "best practice"?

## "Best practices for sending email using Amazon SES" - A developer guide by Amazon Web Services

[You can read the documentation here.](https://docs.aws.amazon.com/ses/latest/dg/best-practices.html)

I'm often pleasantly surprised by the quality and quantity of AWS documentation, and this isn't an exception. I should have done this first, instead of wasting the support team's time.

Although it doesn't say it explicitly, let's assume that if we follow the guidelines given to us by AWS themselves, and we ask nicely, AWS will let us send emails from SES.

The documentation linked above is split into "Success metrics" and "Maintaining a positive sender reputation".

### Success Metrics

This page outlines 3 metrics: Bounces, Complaints and Message quality. ChatGPT has already told me I'm a fabulous writer, so lets look at bounces first.

#### Bounces

If an email can't be delivered successfully, a bounce occurs. This could be either because of a temporary issue like the inbox being full which causes a soft bounce; or a permanent issue like the address not being valid which causes a hard bounce. 

For soft bounces, SES will attempt to deliver the message again over a period of time. Hard-bounces on the other hand are a more serious issue. If a sender causes a lot of hard-bounces, this negatively affects their reputation. 

AWS say that each user of SES has and is responsible for their own sender reputation, but by the wording of their rejection email above, I assume that a non-reputable sender using SES will impact others using it too. 

To avoid bounces and improve reputation, AWS suggests the following:

- Keeping the hard bounce rate below 5%
- Don't buy email lists - these are often full of fake addresses, and some contain traps to identify "illegitimate" senders.
- Keep your list of users up to date
- Purge your mailing list by asking users to confirm that they still want to receive mail from you. If they don't respond to this, remove them from your list.

As my use case is transactional (that is, email is used as a functional part of a service, not for marketing), the main takeaway for me here is to avoid hard bounces by only sending to valid email addresses, and to ensure that recipients of emails are still interested in receiving emails from me.

Perhaps I wasn't clear in my initial message to AWS, but these emails **will only be sent as a reply to users**. This means that, unless they send me an email and then instantly delete their email accounts, there should be no hard bounces. This should also be sufficient evidence that the recipients are interested, as they were the ones to initiate communication.

To handle bounces, AWS suggests:

- Not sending mail to an address that has received a hard bounce
- Ensuring you can receive bounce notifications. By default, these will be sent to your personal email address.
  - Apparently a large amount of bounce notifications can cause the notifications themselves to be flagged as spam by your personal email provider.

I've set up my personal email to receive these notifications, but I didn't explicitly mention in my AWS request that I wouldn't send mail to addresses that had previously bounced.

#### Complaints

When a recipient marks an email as spam or similar, this counts as a complaint. Some mail providers alert the sender when this happens, and SES automatically forwards these complaints to you. However, not all providers will inform you when your email is marked as spam.

AWS recommends keeping your complaint rate below 0.1% to maintain a good sender reputation. As with bounces, ensure you're properly receiving notification messages.

#### Message Quality

AWS advises against using flagged URLs or URL shortening services in your emails. They also suggest including links to your Privacy Policy and Terms of Use documents.

#### Takeaways

From reviewing the above, I need to change my request to explicitly state

- I will not send emails to addresses which have produced a hard bounce in the past
- I will ensure that bounce notifications are well received to my personal email address, and not marked as spam
- Emails that I send are transactional, and not marketing
- I will write and include a link to a Privacy Policy and Terms of Use document
- Users can request to be removed from my list of recipients
- I will ensure that complain notifications will be well received and not marked as spam
- I will not link to flagged URLs, or use URL shortening services

### Maintaining a positive sender reputation

This seems to mostly apply to marketing emails, but mentions the careful choice of the address that you send mail from. I was surprised to find that AWS advises against using `noreply@domain.com` as it doesn't invite feedback. I'll make sure to use a friendly address that is happy to receive criticism - perhaps `roastme` would suffice.
 
It also suggests signing your outbound mail with DKIM. By going to one of my test emails, and clicking "Show Original", I can confirm that SES is singing my emails with DKIM and SPF. 

AWS give advice for building and maintaining a recipient list. This includes using opt-in links and checking that domains have valid MX records. 

Local Email Spam Legislation is referenced here. I'm operating on a budget, so will ask ChatGPT for legal advice. The bonus here is that OpenAI can't train on my data from now, as it will be protected under attorney-client privilege.

> ### Legal Rules for Transactional Emails in the UK
>
> **Transactional emails** are messages that contain information a recipient needs in order to use a product or service, such as:
> - Purchase receipts
> - Shipping confirmations
> - Password resets
> - Account notifications
> - Appointment reminders
>
> #### 1. **No Consent Needed**
> - Under **PECR**, these emails are **not subject to marketing consent rules** because they are essential to the service provided.
> - However, they must still be relevant and limited to necessary information.
>
> #### 2. **Avoid Marketing Content**
> - You **must not include promotional or marketing material** in a transactional email unless you have obtained valid consent.
>   - Even subtle upselling (e.g. "Check out our new collection") can turn a transactional email into a marketing one—triggering PECR rules.
>
> #### 3. **UK GDPR Still Applies**
> - Even though consent isn't required for transactional emails under PECR, the **UK GDPR** still applies:
>   - You must have a **lawful basis** for processing the recipient's data (usually **contractual necessity**).
>   - You must ensure **data minimisation**, **security**, and **transparency**.
>
> #### 4. **Identification and Contact Info**
> - As with all emails, you should clearly identify your business and provide contact details.
>
> #### 5. **Enforcement**
> - The **ICO** can take action if:
>   - A transactional email includes marketing without proper consent.
>   - Personal data is used inappropriately.
>
> ✅ **Summary**: You don't need consent to send transactional emails, but keep them strictly functional. Any marketing content risks breaching UK law.

The above has not been fact checked, as AI is reliable and rarely makes mistakes. This is proven by the tick emoji on the final line. 

#### Takeaways

From reviewing the above, I need to change my request to explicitly state

- I won't send mail from `noreply`
- I have verified that mail is being sent with DKIM and SPF, and will continue to monitor this
- I will manually check that all email addresses are valid addresses with valid MX records (I think all recipients use MX records)
- I will not send marketing mail, or any messaging that could be interpreted as marketing
- I will not store any irrelevant data, and any data stored will be relevant and up-to-date, to remain compliant with GDPR
- I will clearly identify myself in each mail as Alex Dawkins, with my personal email address
- I will include instructions for users to remove themselves from my mailing list

Turns out an email address is classed as personal data. Perhaps emails aren't the perfect user interface after all.

## The wider internet

To maximise my chances of not having to do this again, I did some more research on the internet.

### On Reddit

From various posts complaining about the same issues as mean

> [Key-Boat-7519](https://www.reddit.com/r/aws/comments/1i0ee9z/comment/m6xwin0/)
> I've been through a similar situation with AWS SES. In my case, I found that clearly explaining your email use case and assuring them that your volume, recipient list, and types of emails (transactional, not marketing) is key. I ensured all emails were transactional, often triggered through AWS Lambda and not used for marketing, which perhaps helped in smoother approvals. If you're using another tool for communication, checking out Pulse for Reddit could be a useful parallel for managing engagement, like how Intercom and Mailgun manage customer communications directly. Hope that helps!

> [mikelim7](https://www.reddit.com/r/aws/comments/1i0ee9z/comment/m6xkq77)
> I have done several, including helping others.
> 
> I noticed that those that were rejected did not implement email authentication standards, i.e. SPF, DKIM and DMARC. These standards become more important in 2024 after major mail providers enforced them.


> [Circle_dot](https://www.reddit.com/r/aws/comments/1i0ee9z/comment/m6z503i)
> As a current CSE for SES. Please note, tech support has no bearing on the decision to grant or deny prod access nor do we have any knowledge insight into the criteria that determines access.
> 
> That being said, you are not pre-judged as a spammer, more like a small fry that may not know best email practices that will then affect other users of the shared IP pools.
> 
> Some things that I believe affects access:
> 
> Account age. Is it a new account and by new I mean less than a year old and there are no other aws resources being used.
> 
> Have you done anything in ses beyond verifying the domain. Rigoursly test sending etc. Remember, while in sandbox you can send test emails to other > verified address and domains in the account.
> 
> Did you articulate your need for SES to T&S team? Or did you just say "we need ses for OTP and transactional".
> 
> Did you share an example template?
> [...]


> [CeeMX](https://www.reddit.com/r/aws/comments/16zkput/comment/k3fx3vm/)
> Just tell them what you want to do with it. I needed it for sending mails from local scanners, did some testing, applied for prod and it was fine.

> [TobyADev](https://www.reddit.com/r/aws/comments/16zkput/comment/k3fq4aj)
> I just told them simply what I wanted to do, in detail and they approved. What do you want to do with it? Mine was sending login and registration emails etc and they approved it

> [Flannel_Man_](https://www.reddit.com/r/aws/comments/1fodccu/comment/lop1uno)
> I’ve applied for SES access from 4 separate AWS accounts. Denied 100% on the first try. Pretty much copy paste details from the first try into the response to their denial and it gets accepted.

> [IridescentKoala](https://www.reddit.com/r/aws/comments/1fodccu/comment/lophh2r)
> In my experience it is very common to get denied on the first try. Just provide as much detail as possible when responding.


### Elsewhere

> [Sendune](https://sendune.com/pages/move-out-of-aws-ses-sandbox-and-get-production-access)
> Choose the type of emails you want to send, 'Marketing' or 'Transactional'. Enter the same domain that you have entered earlier. Accept terms and submit request. It is VERY IMPORTANT that the domain you enter here have an active website that showcases the nature of your business. AWS might reject your request if you do not have a website or just have a generic landing page.
> [...]
> That's it. You can sit back and relax. If everything is in order AWS will move your SES account into production and you will be able to send emails. It might take upto a day before AWS grants your request. Occasionally AWS might send you an email asking for more details. Reply with as much detail as possible. You must be able to convince AWS that you are a genuine email sender.

### Takeaways

It sounds like others have been rejected, and seem to have better luck by doing the opposite of what I'm doing here.

From reviewing the above, I need to change my request to explicitly state

- I have low volume and few recipients
- These are transactional emails
- Emails used DKIM, SPF, and DMARC
- My intended template
- That my website clearly explains the use case

# My response

With the following improvements, I will write my response:

- I will not send emails to addresses which have produced a hard bounce in the past
- I will ensure that bounce notifications are well received to my personal email address, and not marked as spam
- Emails that I send are transactional, and not marketing
- I will write and include a link to a Privacy Policy and Terms of Use document
- Users can request to be removed from my list of recipients
- I will ensure that complain notifications will be well received and not marked as spam
- I will not link to flagged URLs, or use URL shortening services
- I won't send mail from `noreply`
- I have verified that mail is being sent with DKIM and SPF, and will continue to monitor this
- I will manually check that all email addresses are valid addresses with valid MX records (I think all recipients use MX records)
- I will not send marketing mail, or any messaging that could be interpreted as marketing
- I will not store any irrelevant data, and any data stored will be relevant and up-to-date, to remain compliant with GDPR
- I will clearly identify myself in each mail as Alex Dawkins, with my personal email address
- I will include instructions for users to remove themselves from my mailing list
- I have low volume and few recipients
- These are transactional emails
- Emails used DKIM, SPF, and DMARC
- My intended template
- That my website clearly explains the use case

> Hello,
> 
> Thank you for taking the time to review my application.
> 
> I'm currently developing a small, personal project called [REDACTED], which allows users to upload their travel photos and view a map-based visualisation of their journey. This is a low-volume, friends-only application designed for personal use and experimentation. Users interact with the system by emailing [REDACTED] with their photos and optional metadata. This triggers a backend process that generates a JSON file describing their journey, which is then used to render the map-based frontend in React.
> 
> Once processing is complete, I send a transactional email to the sender’s address with a link to view their journey. This is not a marketing or promotional email — it is purely transactional and directly initiated by the user’s action.
> 
> Here are the key compliance and anti-abuse measures I’ve implemented:
> 
> - I will not send emails to addresses that have previously resulted in a hard bounce. Bounce notifications are configured to be received at my personal address and will be regularly monitored.
> - Complaints will also be directed to my personal address, and I will ensure these notifications are not filtered as spam.
> - Emails are transactional only, with no marketing or promotional content. I do not use shortened URLs or link to any flagged domains. All links point directly to my verified domain.
> - I do not send from `noreply` addresses. All messages clearly identify me as Alex Dawkins and include my personal contact email.
> - I have configured and verified SPF, DKIM, and DMARC for my domain, and will continue to monitor their status.
> - I will manually verify that each recipient uses valid MX records before sending. My user base is small and composed of individuals I know personally.
> - Each email includes instructions for recipients to request removal from the list. Upon such a request, I will remove them from my allowlist and they will no longer be able to use the service or receive emails.
> - I am drafting a Privacy Policy and Terms of Use, which will be publicly accessible on my site. I only store relevant, minimal data needed to process user requests, and I will ensure compliance with GDPR principles.
> - The website clearly describes the purpose and function of the service so users understand how their data is used.
> 
> Below is an example of the intended email template I plan to send:
> 
> ---
> 
> <an altered draft>
> ---
> 
> Sincerely,  
> Alex Dawkins

I will also include the Terms of Service and Privacy Policy in the appendix on my website.

# Conclusion

So, in order to avoid using a pesky SSO provider, I have learnt about how email reputation works, anti-abuse best practices, and written 2 legal documents. 

Hopefully I will be able to use SES in the future for other projects to amortise the effort required to reduce my efforts. I will submit the above to AWS and update this page with their response. If you have found this page while trying to solve your own SES woes - good luck, and feel free to reach out: alexander (dot) dawkins (at) gmail (dot) com.

# Update - 14/05/2025

After sending the updated message, I was rejected with a similar message to before! I couldn't believe it.

I sent the following message asking for clarification. 

> Hi 
>
> Thank you for your response.
>
> I don't understand why my use case is problematic - these are transactional emails that are requested by the user by using my service. Could you explain how this use case is different from say a Password reset request? In both cases, the user performs an action, and receives a transactional email back. I have reviewed the AWS SES Best Practices documentation and can't see anything that this use case goes against. Any indication would be appreciated.
>
> Thanks again
>
> Alex

As the first rejection message said that they were unable to provide more information, I was doubtful that this would lead to any useful feedback. 

After a few days, I received this message

> Hello,
> 
> This case was escalated for a secondary review. We appreciate your patience while we have reviewed your case.
> 
> Your new sending quota is 50,000 messages per day. Your maximum send rate is now 14 messages per second. We have also moved your account out of the Amazon SES sandbox.
> 
> This takes effect immediately in the Europe (London) region. You can view the current sending rate and sending quota for your account on the Sending Statistics page of the Amazon SES console, or by using the GetSendQuota API.
> 
> As you get started with Amazon SES, keep in mind that you must:
> 
> - Comply with the AWS Acceptable Use Policy ( http://aws.amazon.com/aup/  ) and read the Amazon SES Service Terms (section Amazon Simple Email Service (SES) of http://aws.amazon.com/service-terms/  ).
> 
> - Send only high-quality emails to recipients who expect to hear from you. For more information, see https://docs.aws.amazon.com/ses/latest/dg/best-practices.html .
> 
> - Set up a process to handle bounces and complaints. For more information, see https://docs.aws.amazon.com/ses/latest/dg/monitor-sending-activity. html .
> 
> - Use your new account to send a different type of email than you are sending from your other account(s), if applicable. For more information, see http://docs.aws.amazon.com/ses/latest/DeveloperGuide/multiple-accounts.html .
> 
> - Use the Amazon SES mailbox simulator to test your system so that your testing does not adversely impact your account. For more information, see https://docs.aws.amazon.com/ses/latest/dg/send-an-email-from-console.html .
> 
> - Apply for higher sending limits before you need them. For more information, see https://docs.aws.amazon.com/ses/latest/dg/manage-sending-quotas-request-increase.html .
> 
> - With Amazon SES, you pay only for what you use. There are no contract negotiations and no minimum charges. For more information see: https://aws.amazon.com/ses/pricing/ 
> 
> Thank you for using Amazon Web Services.
> 
> We value your feedback. Please share your experience by rating this and other correspondences in the AWS Support Center. You can rate a  correspondence by selecting the stars in the top right corner of the correspondence.
> 
> Best regards,
> Trust and Safety

Sweet, sweet victory at last. 

# Appendix

I have included the following as references only - I take no responsibility for what you do or do not do with the following. This is not legal advice.

## Terms of Service

> **Effective Date**: 09/05/2025
> 
> By using the [REDACTED] service (the "Service"), you agree to be bound by these Terms of Service (the "Agreement"). If you do not agree with these terms, you must not use the Service.
> 
> #### 1. **Description of the Service**
> [REDACTED] is a personal project that allows users to upload images and view a journey map based on the location data from the images. The Service is available exclusively to invited individuals (friends and family) and is for personal, non-commercial use only.
> 
> #### 2. **User Responsibilities**
> - You must provide accurate and truthful information when using the Service.
> - You agree not to upload, share, or transmit any content that violates any laws or intellectual property rights.
> - You are solely responsible for maintaining the confidentiality of your personal information, including your email address.
> 
> #### 3. **Usage Restrictions**
> You agree not to:
> - Use the Service for commercial purposes.
> - Attempt to reverse engineer, decompile, or otherwise tamper with the Service's source code or systems.
> - Use the Service in a way that could damage, disable, or impair its functionality.
> - Upload or distribute any harmful or malicious code.
> 
> #### 4. **Privacy**
> Your use of the Service is subject to our Privacy Policy, which outlines how we collect, use, and protect your personal data.
> 
> #### 5. **Intellectual Property**
> All content, materials, and intellectual property related to the Service are owned by Alex Dawkins. You are granted a limited, non-transferable license to use the Service in accordance with these Terms of Service.
> 
> #### 6. **Termination**
> We reserve the right to terminate or suspend your access to the Service at our discretion, particularly if you violate these Terms of Service.
> 
> #### 7. **Disclaimer of Warranties**
> The Service is provided "as is" and "as available" without any warranties, either express or implied. We do not guarantee the accuracy, reliability, or availability of the Service at all times.
> 
> #### 8. **Limitation of Liability**
> To the fullest extent permitted by law, Alex Dawkins shall not be liable for any indirect, incidental, special, or consequential damages, including loss of data, profits, or use, resulting from your use or inability to use the Service.
> 
> #### 9. **Indemnification**
> You agree to indemnify and hold harmless Alex Dawkins from any claims, damages, or expenses that arise from your use of the Service, including but not limited to any content you upload.
> 
> #### 10. **Changes to Terms**
> We reserve the right to update or change these Terms of Service at any time. You will be notified of any significant changes, and continued use of the Service after such changes will indicate your acceptance of the updated terms.
> 
> #### 11. **Governing Law**
> These Terms of Service shall be governed by and construed in accordance with the laws of [Your Country/Region].
> 
> #### 12. **Contact Information**
> If you have any questions about these Terms of Service, please contact us at:
>
> Email: [REDACTED]



## Privacy Policy
> **Effective Date**: 09/05/2025
> 
> This Privacy Policy explains how [REDACTED] (the "Service") collects, uses, and protects your personal information when you interact with the Service. By using the Service, you agree to the collection and use of information in accordance with this policy.
> 
> #### 1. **Information We Collect**
> We collect the following types of personal information:
> - **Email Address**: To communicate with you and send you transactional emails regarding your journey.
> - **Image Data**: When you upload images, we may collect location information (if available) and other metadata associated with your photos.
> - **Feedback**: Any feedback you provide to us via email.
> 
> #### 2. **How We Use Your Information**
> We use your personal information for the following purposes:
> - To process your uploaded images and generate the journey map.
> - To send you transactional emails, including notifications about your journey.
> - To improve the Service and respond to your inquiries or feedback.
> 
> #### 3. **Public Sharing of Images**
> By uploading a photo to the Service, you agree that the image, its associated location data, and your email address may be shared publicly and made accessible to anyone on the open internet. Once uploaded, your image and related data will be available for public access without restriction. The location data (if included in the photo metadata) and email address associated with your journey will also be publicly accessible.
> 
> If you request it, we will remove the image and associated data from the public view. However, please note that even if we remove the data from our Service, it is possible that it has already been cached or stored by third parties, anonymously or otherwise, outside of our control. We are not responsible for any data that has been copied or saved by these third parties.
> 
> #### 4. **How We Share Your Information**
> We do not share your personal information with third parties except in the following circumstances:
> - If required by law or a legal process.
> - If we believe it is necessary to protect our rights or the rights of others.
> - If we engage third-party service providers to assist in operating the Service (these providers are bound by confidentiality agreements).
> 
> #### 5. **Data Retention**
> We will retain your personal information only for as long as necessary to provide the Service, comply with legal obligations, resolve disputes, and enforce our agreements.
> 
> #### 6. **Your Data Protection Rights**
> You have the following rights regarding your personal information:
> - The right to access and review the personal data we hold about you.
> - The right to request the correction of inaccurate or incomplete data.
> - The right to request deletion of your personal data (subject to certain limitations).
> - The right to request removal from our email list (you may contact us at any time to opt-out).
> 
> #### 7. **Security of Your Information**
> We take reasonable measures to protect your personal information from unauthorized access, alteration, or destruction. However, no method of transmission over the internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
> 
> #### 8. **Cookies and Tracking Technologies**
> We may use cookies and other tracking technologies to improve the user experience. You can control cookies through your browser settings, but disabling cookies may affect some features of the Service.
> 
> #### 9. **Links to Other Websites**
> The Service may contain links to external websites. We are not responsible for the privacy practices or content of these external sites.
> 
> #### 10. **Non-Commercial Nature of the Service**
> The Service is a non-commercial, personal project. While we strive to comply with all relevant laws and best practices regarding data protection and user privacy, we do not accept any responsibility for any consequences or outcomes of others using the Service. You acknowledge that use of the Service is entirely at your own risk, and that we are not liable for any damages, losses, or issues arising from your use of the Service.
> 
> #### 11. **Changes to This Privacy Policy**
> We may update this Privacy Policy from time to time. Any changes will be posted on this page with an updated "Effective Date." Your continued use of the Service after such changes indicates your acceptance of the revised policy.
> 
> #### 12. **Governing Law**
> This Privacy Policy is governed by the laws of [Your Country/Region].
> 
> #### 13. **Contact Information**
> If you have any questions about this Privacy Policy or how we handle your personal information, please contact us at:
> 
> - **Email**: [REDACTED]