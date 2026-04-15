---
title: Pragmatist's Guide to AI
description: Everything changes except what didn't
published: 2026-04-14
draft: false
---

I'm going to talk about "pragmatism". No matter if AI frees us all from work, or destroys our social fabric, you will still get out of bed tomorrow morning, and fulfil your responsibilities to your loved ones, friends, and colleagues. I want to help you engage with AI pragmatically.

I take that mission seriously. I know a good deal about the kind of work that some of you do, and nothing about some others. But I'm not going to talk about the special problems of your department, seniority, or role. Instead I'm going to talk about some basic observations that you surely can put into action no matter your station.

Once upon a time I attended a tech conference overseas. The damage was done. I returned home with a head full of ideas and a stomach full of excitement to build them. I caught the startup bug. That was in 2014. Today, my wife and I are planning a family. We have dreams for our kids. Financially, my career so far has been a wash. I'll probably need to work for a decade more, maybe two.

Since my career is near the frontier of software, the effects of new technology are more acutely felt. I have always loved trying new software. Recently, this habit has turned into a frequent reminder that my career path is changing ever faster. Will I still be employed in a few years? Will my company survive or will I have to find a new job in a decade? Will we be able to afford our kids the lifestyle and opportunities we desire?

I don't believe that AI is the cause of these anxious questions. But it is a catalyst. And before I can lay out a plan of action, we need to get our bearings. What is AI, really? Why is the conversation around it so noisy? How fast are things actually changing? 

Once we know the landscape, we can start to engage with it more pragmatically.

## AI is software

> Artificial Intelligence is whatever hasn't been done yet.
>
> — Tesler, 1970{% ref n=1 /%}

By 2015, modern deep learning had arrived in every household. One of the first mass-market AI apps, Google Photos automatically tagged your friends' faces, and later your pets' faces too.

Computer scientists had figured out how to combine GPUs with an incomprehensible amount of data to do something useful. In the ensuing decade, this recipe spread to many use cases, from the mundane (spam filters, photo search, translation) to the controversial (deepfakes, surveillance).
### A bet on massive compute

R&D was concentrated in companies with deep pockets, global reach, top talent, and obvious commercial application - ad targeting and recommendations, self-driving cars, speech and translation. By 2019, a startup saw fit to make a bet without a clear path to revenue. OpenAI's work on GPT-2 and GPT-3 proved that exponentially more compute applied to massive data would create something new.

In November 2022, GPT-3.5 and ChatGPT launched. A toy for having conversations with a computer. In two months it was the fastest growing consumer app in history. A new kind of software had arrived. It could be programmed in English and follow instructions coherently.
### Agents

Since ChatGPT, LLM capabilities have been measured in terms of their ability to reliably follow instructions, use software tools, and complete useful tasks on a computer.

Today when someone says that AI will change everything, they are usually talking about a new kind of software. Software that when given a goal, a sandbox, and other software tools, can intelligently decide what tools to use to achieve the goal, and reliably use them until something useful is achieved.

This is a big deal. But it's still software - and software is a tool for getting useful things done.
### Not death and taxes

> A system that exhibits all the cognitive capabilities humans have... things like continued learning, going beyond what they've been trained for... in the real world where they need to learn on the fly. There's a few missing capabilities that are quite critical to what I would regard as an AGI system.
>
> — Hassabis, 2025{% ref n=2 /%}

Nobody knows when AGI, ASI, or the singularity will be achieved. We can engage with these ideas seriously as a matter of curiosity and imagination, but they needn't have any bearing on decisions we make today.
### Anthropomorphize with caution

LLMs exhibit many human behaviours, except for their *jagged intelligence*{% ref n=3 /%}. As the technology matures, people want to know what they can or cannot use LLMs for. They measure and share LLM capabilities using public or private benchmarks.

Even today's smartest models still demonstrate a *jagged technological frontier*{% ref n=4 /%} when paired with human users. By human standards, some tasks can be done really well, while some tasks fail miserably. Unlike humans, even as the best models get overall more capable, they continue to exhibit jaggedness in unpredictable ways. There is no evidence yet that this characteristic can be resolved.
### A runaway flywheel

Like the deep learning models before it, LLMs benefit from the feedback loop of adoption. The more people use a model, the more feedback on whether the model outputs are valuable, the better the next generation of models. This is a runaway flywheel.

> There were 1 billion commits in 2025. Now, it's 275 million per week, on pace for 14 billion this year if growth remains linear (spoiler: it won't.)
>
> — GitHub{% ref n=5 /%}

Coding is the bellwether of LLM adoption. Even if only 1% of this activity is useful, it spins a flywheel that turns improving capabilities into a self-fulfilling prophecy.

{% panzoom src="ai-demand-matrix.svg" %}
Two axes: how much demand there is for the task, and whether its outcomes can be verified. Adapted from Tom Tunguz's AI Problem Matrix.{% ref n=6 /%}
{% /panzoom %}

Tasks with uncapped demand (top row) benefit sooner from this improvement flywheel because of rapid adoption. Tasks with finite demand will see capabilities improve more slowly, but those with objective outcomes (right column) will still improve by buying or collecting proprietary data.

I wrote about how to pick problems to solve with LLMs outside of coding in [Feeding computer agents](/2026/feeding-computer-agents).

## Catastrophe or panacea

> Any sufficiently advanced technology is indistinguishable from magic.
>
> — Clarke, 1973{% ref n=7 /%}

Modern AI may as well be magic for most people. It takes too much time and effort to understand. And we are all susceptible to lazy narratives. 

AI is not going to kill us all, nor will it solve all human suffering. With so few honest narrators, it is tempting to bury our heads in the sand. But I believe that by first recognizing sensationalist headlines, we can start to engage pragmatically with the topic.
### Uninformed journalism

Last week the New York Times published this headline: "How A.I. Helped One Man (And His Brother) Build a $1.8 Billion Company."{% ref n=8 /%} On Instagram it was shared 10x more than news about the Artemis II mission. Three days later the profiled company lost its certification to run digital advertising, due to an ongoing investigation into unethical acquisition practices.

Unfortunately, this is an all too common example that many journalists don't understand the technology or businesses they are covering. Nuanced coverage of emerging technology is rare in the mainstream press.
### Grifters in the feeds

I use social media to keep up with companies and experts that I admire. The challenge here is that it's hard to separate insight from noise.

People love their silver bullets. And the internet is full of promises of amazing outcomes for little to no effort. Paid or biased influencers push the latest products and solutions. Grifters sell things that promise results and prevent certain doom.

It's crucial to proactively curate the feed and not relinquish full control to the algorithm.
### Carrot and stick

The adoption of AI has become the number one issue for business executives. No one wants to be left behind. No one wants to be seen as being uninnovative. Middle managers are told they should be vibe coding. Employees are told their productivity and work output should be going through the roof.

> Our co-founder Simon's record is letting a coding agent run for 13 days straight. His bedtime routine now includes giving his agents enough work to keep running until breakfast.
>
> — Notion, 2026{% ref n=9 /%}

A lot of this FOMO has been generated by the very companies selling these solutions to us. Never before has a technology been sold so passive-aggressively: AI will solve your problems, and you should feel bad if you're not using it yet.
## Product-market fit

People debate whether there is an AI bubble. Of course it's a bubble. We live in a moment where an emerging technology literally cannot be more hyped, while at the same time its impact is probably still under-appreciated.

The bubble debate is about valuations. But nobody is debating the adoption and revenue numbers. Anthropic announced last week that its annualized revenue passed $30b, up from $9b at the end of last year.{% ref n=10 /%} Snowflake took a decade to reach $1b, but Anthropic got there in 3 years, then added $29b in 1 year.

While closed models dominate the revenue headlines, adoption of open-source models is also unprecedented - about 30% of LLM tokens by end of last year.{% ref n=11 /%} And cutthroat competition among closed and open source labs will likely continue to improve model capabilities and costs at the same time.

Model providers are currently supply constrained - the demand for GPUs far outstrips what the supply chain can provide. Most of the gigantic headline numbers of AI investment are allocated to building GPUs in the future. As models become both more capable and cheaper, demand for them will grow. As model providers continue to struggle to service all the demand, they will raise prices and throttle low-value demand. Every new GPU that comes online will serve someone who's already waiting.

Even if the music stops tomorrow, we will probably use LLMs more, and at better prices on average. The genie isn't going back in the bottle.
## A pragmatic question

> I very frequently get the question: 'What's going to change in the next 10 years?' And that is an interesting question… But I almost never get the question: 'What's not going to change in the next 10 years?' And I submit to you that that second question is actually the more important of the two.
>
> — Bezos, 2012{% ref n=12 /%}

AI is revolutionary software. Don't blindly trust narrators of this new technology. And recognize that its adoption and growth is unprecedented in history. This is the current landscape.

But the rate of progress and change is still too fast to stomach. That's why the pragmatist asks not what is going to change, but what is not.

Let's discuss what doesn't change with AI.
## New tools, same work

> Software is getting slower more rapidly than hardware is becoming faster.
>
> — Wirth, 1995{% ref n=13 /%}

More capable tools don't guarantee better outcomes. Everyone already has access to the same tools today, but the work quality varies. Elegant products with considered user experiences coexist with janky products that just get the job done.

More intelligent software doesn't guarantee more elegant solutions. That's something we'll still have to fight for.

> Work expands so as to fill the time available for its completion.
>
> — Parkinson, 1955{% ref n=14 /%}

Smarter tools don't magically get us to the destination faster. Tools must be used correctly. Priorities must be set. Constraints must be defined. 

Useful tools are supposed to save us time. An Anthropic study of global workers showed that 20% of AI users say they're now afraid of _losing_ time to AI, because workplace productivity expectations have already risen.{% ref n=15 /%} They're working longer hours, not less.

Software needs continued maintenance. Cybersecurity concerns mean someone must still sign off on what gets shipped to production. The greater the autonomy, the greater the demand for quality assurance and compliance.

Due to fast emerging and poorly understood usage patterns, we will have to contend with securing both large quantities of AI-generated work, and new attack vectors.

AI promises capabilities, productivity, and autonomy. But like software, those gains can quickly get absorbed by scope, bloat, and new expectations. If we want quality, less work, and accountability, we'll have to fight for it.
## Human nature

Everybody needs a friend. And AI is super agreeable and patient. This poses cognitive security risks ranging from entertaining to full blown AI psychosis.{% ref n=16 /%}
### Surface-level understanding

Watch out for three kinds of behaviours that reliably appear with new tools and techniques - cargo cults, slot machines, and astrology.

**Cargo cults**: sharing and copying the rituals of other users without considering why it works for them and whether that's relevant.

**Slot machines**: occasional brilliance keeps you pulling the lever until you're addicted and reach for AI to do everything, even when it doesn't make sense.

**Astrology**: ascribing deep meaning to best practices, special prompts, mysterious jargon, and forgetting that it's just software.

These are symptoms of the same thing - trying to make sense of a new fast-changing technology without a grounded understanding of how it works.

It's fun, and often that's what gets us invested in the first place. But once in a while we all need a nudge back to reality.
### Performative productivity

> When a measure becomes a target, it ceases to be a good measure.
>
> — Goodhart, 1975{% ref n=17 /%}

Last week Meta announced they were taking down an internal token leaderboard after its existence generated controversy.{% ref n=18 /%} On one hand, large organizations do need a big push to drive big organizational behaviour changes. On the other hand, when everyone is tokenmaxxing, it becomes impossible to discern work from busywork.

This is a symptom of a culture where too many people have responsibilities disconnected from what makes the team or business win. I believe we should be tokenmaxxing, but the budget should be determined bottom up. Executives should be ready to grant maximum AI capabilities to those who ask for it. If a top-down mandate is required, there may be a need to evaluate if fresh blood is needed in management and staff.

Under-performers can hide behind the complexity of new technology, or the challenges of change management, for longer than a team can retain its top talent.

The pragmatist remembers that tokenmaxxing is only one sign of adoption and productivity. There are others.

### Armchair skeptics

> The most confident takes on AI often came from the least exposure. Rejection is easy, trial and error is expensive.
>
> — Ronacher, 2026{% ref n=19 /%}

Fair evaluation of new technology is hard because you must first try to use it. Usually it's imperfect in unexpected ways, so it takes time to learn and unlearn what a new tool is good for.

It's too easy to read someone else's critique and parrot those problems into reasons not to try something. An Anthropic study of global workers found that among most tensions reported by respondents, the benefits were more grounded in lived experience, while the harms were more hypothetical.{% ref n=15 /%}

The pragmatist puts in hands-on time and effort to understand the tools.
## The barbell

In the war for talent (or desirable jobs), COVID broke geographical and language barriers. AI is now breaking digital literacy barriers.

AI lets anyone who's interested in using a computer well do so. The un-gatekeeping of every valuable computer skill has already started. The set of people who can do your job will expand.

The un-gatekeeping discriminates no one. When barriers disappear, the floor rises for everyone. On average, anyone can do pretty much anything at a higher standard. The ceiling rises too. Domain experts get even more leverage out of AI, offloading the work they don't enjoy and expanding into adjacent domains out of interest or ambition.

At the greatest risk are high-paying and flexible working arrangement jobs that appeared in the last fifteen years. With competition showing up faster than ever before, companies without durable revenue streams are already being punished.

Like other industries before it, knowledge workers will converge to either highly paid top performers or cost-effective flexible workers. The mushy middle will be squished. 

This is barbell theory at work.
### A new contract

I believe executives owe it to their teams to quickly figure out who has the potential to ride this wave and who doesn't. Those who have the interest and wherewithal should be showered with resources. Those who don't should get a reality check sooner rather than later. 

Compensation needs to be rethought. Fewer staff will be paid more. If someone is using AI to enhance critical-path work, their pay needs adjustment to reflect their value. Competitors will notice otherwise and recruit them. 

The way out of the middle of the barbell is simple - learn how the company actually makes money. Figure out the connection between that and your job role. Executives should make sure everyone in the company is empowered to understand this single fact.

While it has never been easier to build something or start a business, it has also never been more competitive. Most younger staff are probably better off joining AI-forward teams at businesses with more durable revenue to learn and network. Executives should dedicate more time and energy to recruiting fresh graduates.

The pragmatist reflects on what makes their team and company win, and knows their place on the barbell.
## Worth doing

When everyone thinks AI can do anything, the differentiator is deciding what's worth doing - the judgement of knowing what not to build, perfect, and maintain.

Customers are great at describing pain points, but terrible at describing solutions. Solving a problem in an innovative way is the responsibility of the maker, not the customer. AI can be a great brainstorming partner, but it doesn't know better than the most patient and talkative customer.

The gap between teams that understand this and teams that don't will widen faster than ever before. I believe in using AI to try and throw away as many ideas as possible, so that I may perfect and maintain only the best ones.

When everyone thinks AI can do everything, the temptation is to build everything.

Off-the-shelf software is usually imperfect, and sometimes hard to use. More often than not, its users haven't even seriously tried to learn how to use it. I believe these users should absolutely try to vibe-code their own software solutions. At least they understand their own pain points. But under no circumstances should we develop one-off solutions for them. Their problems weren't painful enough for them to learn how to use off-the-shelf software, and handing these problems off to another person with no domain expertise to solve is a total distraction.

To a hammer, everything looks like a nail. And this hammer hasn't figured out yet what its team should do to win.

Good judgement comes from experience, skin in the game, and care. I believe AI amplifies these qualities, not replaces them.

The pragmatist is open-minded to novel ways of solving problems, but is humble enough to know that not all problems are worth solving.
## Getting alignment

Most days I'd rather talk to Claude than ping someone on Slack. I think it's the instant gratification and upbeat attitude. 

Working with AI can easily displace collaboration. In most teams, fewer meetings are probably a net positive. But there is a real risk when people retreat from working with their human teammates.

> The one part of PM work that AI can't automate yet: getting six people in a room to agree.
>
> — Rachitsky{% ref n=20 /%}

Leadership, alignment, and coordination are more important than ever. When things move faster, keeping everything moving in the same direction requires more energy.

Getting a working team aligned on priorities. Persuading the skeptic. Rallying the team through uncertainty. Reading a room to know when to push and when to wait. AI doesn't do this. 

Junior staff are at a big disadvantage here. Since remote work became mainstream, there are fewer venues for them to learn these verbal or written teamwork skills. If more people retreat into solo AI work, these skills get rarer at the very time they become more valuable.

Executives should enable junior staff to be in rooms where they can practice getting alignment. This might even be a recruitment differentiator.

Just because I love talking to Claude doesn't mean I can stop talking to colleagues. The pragmatist practices persuading AI and humans equally.

## Finding your place

Gainful employment will boil back down to four core archetypes:

**Builders**: make things people want. Translate requirements to AI, judge whether the output is right, ship, communicate.

**Gardeners**: keep things running. Tend to policies, constraints, budgets. The environment where builders can work safely.

**Hot people**: talk to the world. Sales, relationships, charisma, recruitment. AI amplifies their reach.

**Grown-ups**: human sign-off, alignment, signing cheques, setting deadlines, getting people in a room to agree.

Which one are you? Most people belong to one archetype. Some two. Three is where things get interesting.

The pragmatist figures out which one they are and develops their strengths. If time and interest allows, they develop an adjacent one.

## One more thing

> As AI gets better at performing routine tasks traditionally done by humans, only stressful ones will be left. The work experience could suffer.
>
> — Benenson, 2019{% ref n=21 /%}

Don't worry. No matter what happens we'll find something to stress about.

{% citations %}
{% cite n=1 %}Tesler's Theorem. Larry Tesler, "Adages and Coinages." Retrieved from [nomodes.com](https://www.nomodes.com/larry-tesler-consulting/adages-and-coinages).{% /cite %}
{% cite n=2 %}Demis Hassabis, ["Google DeepMind CEO Demis Hassabis on AI in the Military and What AGI Could Mean for Humanity"](https://time.com/7280740/demis-hassabis-interview/), *TIME*, 2025.{% /cite %}
{% cite n=3 %}Andrej Karpathy, [post on X](https://x.com/karpathy/status/1816531576228053133), July 2024, coining "jagged intelligence" to describe the uneven capability profile of LLMs.{% /cite %}
{% cite n=4 %}Fabrizio Dell'Acqua et al., ["Navigating the Jagged Technological Frontier: Field Experimental Evidence of the Effects of AI on Knowledge Worker Productivity and Quality"](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=4573321), Harvard Business School Working Paper, 2023.{% /cite %}
{% cite n=5 %}Kyle Daigle (GitHub), [post on X](https://x.com/kdaigle/status/2040164759836778878).{% /cite %}
{% cite n=6 %}Tom Tunguz, ["The AI Problem Matrix"](https://tomtunguz.com/ai-problem-matrix/).{% /cite %}
{% cite n=7 %}Arthur C. Clarke, *Profiles of the Future: An Inquiry into the Limits of the Possible* (1973 revised edition). Known as Clarke's Third Law.{% /cite %}
{% cite n=8 %}["How A.I. Helped One Man (And His Brother) Build a $1.8 Billion Company"](https://www.nytimes.com/2026/04/02/technology/ai-billion-dollar-company-medvi.html), *The New York Times*, April 2, 2026.{% /cite %}
{% cite n=9 %}Notion, [post on X](https://x.com/NotionHQ/status/2043898497381093436).{% /cite %}
{% cite n=10 %}Anthropic, ["Anthropic expands partnership with Google and Broadcom for multiple gigawatts of next-generation compute"](https://www.anthropic.com/news/google-broadcom-partnership-compute).{% /cite %}
{% cite n=11 %}OpenRouter, ["State of AI"](https://openrouter.ai/state-of-ai).{% /cite %}
{% cite n=12 %}Jeff Bezos, ["2012 re:Invent Day 2: Fireside Chat with Jeff Bezos & Werner Vogels"](https://www.youtube.com/watch?v=O4MtQGRIIuA), AWS, 2012.{% /cite %}
{% cite n=13 %}Niklaus Wirth, "A Plea for Lean Software," *IEEE Computer*, February 1995.{% /cite %}
{% cite n=14 %}C. Northcote Parkinson, "Parkinson's Law," *The Economist*, November 19, 1955.{% /cite %}
{% cite n=15 %}Anthropic, ["Anthropic Economic Index Report: Uneven geographic and enterprise AI adoption"](https://www.anthropic.com/features/81k-interviews).{% /cite %}
{% cite n=16 %}Jonathan Jarry, M.Sc., ["A Journey into 'AI Psychosis'"](https://www.mcgill.ca/oss/article/critical-thinking-technology/journey-ai-psychosis), McGill Office for Science and Society.{% /cite %}
{% cite n=17 %}Goodhart's Law. Charles Goodhart, "Problems of Monetary Management: The UK Experience" (1975).{% /cite %}
{% cite n=18 %}Isabelle Bousquette, ["Why Some Companies Say AI 'Tokenmaxxing' Is Key to Survival"](https://www.wsj.com/cio-journal/why-some-companies-say-ai-tokenmaxxing-is-key-to-survival-e699a128), *The Wall Street Journal* (CIO Journal).{% /cite %}
{% cite n=19 %}Armin Ronacher, ["The Center Has a Bias"](https://lucumr.pocoo.org/2026/4/11/the-center-has-a-bias/), lucumr.pocoo.org, April 2026.{% /cite %}
{% cite n=20 %}Lenny Rachitsky, [post on X](https://x.com/lennysan/status/2041166073794592926).{% /cite %}
{% cite n=21 %}Fred Benenson, ["Artificial Intelligence Will Make Your Job Even Harder"](https://web.archive.org/web/20250304045417/https://www.theatlantic.com/ideas/archive/2019/09/artificial-intelligence-will-make-your-job-even-harder/597625/), *The Atlantic*, September 2019.{% /cite %}
{% /citations %}
