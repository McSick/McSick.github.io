+++
draft = true
title = "Open Telemetry"
date = "2022-04-26T21:52:33-04:00"
author = "Michael Sickles"
authorTwitter = "McSick" #do not include @
cover = "otel.png"
tags = ["OpenTelemetry", "Thoughts"]
keywords = ["OpenTelemetry", "Thoughts"]
description = "Once upon a time, there was competing standards on how the industry should do application telemetry. So out there, a new standard was created to consolidate the competing standards.  Somehow it actually worked.  The competiting standards have decided to deprecate themselves and merge into OpenTelemetry."
showFullContent = false
readingTime = false
hideComments = false
+++

Once upon a time, there was competing standards on how the industry should do application telemetry. So out there, a new standard was created to consolidate the competing standards.  Somehow it actually worked.  The competiting standards have decided to deprecate themselves and merge into OpenTelemetry.

# A specification is born

OpenTelemetry relies on a [specification](https://github.com/open-telemetry/opentelemetry-specification) to dicate the rules around generating this telemetry. It includes items like naming schemes, header structure, parsing identifiers, and semantic conventions. It has subcategories around the different types of signals like logs, traces, and metrics.  The various coding languages implement this specification.  There are core parts which are part of the main projects. There are contrib parts which are community contributed integration points.  Candidly, it's a lot. There is so much, someone could probably write a book on it. In fact someone probably has written a blog on it.  So how would an engineer like yourself start to go about learning OpenTelemetry? Also, how much time will it take you to bring this back to your organization? Is it even worth it?

# Why you should invest in OpenTelemetry

So I just said it's a lot and intimidating. I really do think it is worth it though.  One of the main draws of OpenTelemetry is the fact that it is vendor agnostic.  It gives you the engineer control of your insights.  We can now be past the days where instrumenting your code means pulling in some vendor SDK or agent. That kinda sucks when your vendor is not living up to their promise and you need to switch to a different vendor.  It takes precious time to rip out the old SDK and put in a new one to do the same thing with slightly different conventions. Instead, you instrument once, and just point to your vendor of choice. Extra benefit in that your telemetry will retain it's structure between vendor.  Each vendor may have a different UI to help you interpret that data and so you will pick the tools which best help your teams solve problems.  Most of the major players in the monitoring and observability space now support it. They see the writing on the wall as OpenTelemetry has gained traction fast with some of the largest companies out there.  Yes you will have some upfront work to switch to this new way of instrumenting your application. I am asking you to do like you have done before, switch from a vendor's agent and SDK to a new agent and SDK.  However, you now own it which means hopefully your team wont have rip out the code yet again when your vendor contract is up in 1-3 years. 

#  How to get started