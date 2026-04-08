---
title: Feeding Computer Agents
description: Bigger than coding agents
published: 2026-03-23
---

Are you good at understanding how non-technical people do their job? Can you easily understand their pains, and design technical requirements to solve their problems? If the answer is yes, then focus on building software for computer agents.

## "Harness engineering"

In March, everyone was talking about "harness engineering." A friend Vincent brought together some friends for a call to share our takes on putting "harness engineering" into practice. I thought about my own experience building stuff with computer agents since January. I decided to talk about why we should all be building with computer agents - and why that means building software *used by* computer agents.

## Why computer agents?

> *"And the Macintosh was supposed to be the computer for people who just wanted to use a computer without having to learn how to use one."*
>
> Steve Jobs, 1990

For techies, Claude Code is a revolution. Since last November, anybody who used to think writing code was a prerequisite to building software, no longer has to manually write it. The practice of designing and developing software is unrecognizable from before.

Meanwhile, normies have gotten 10x better chatbots and 10x better search, and a whole lot of viral LinkedIn posts dressing up productivity theatre. I love a quick fix as much as anyone, but the jury is still out on whether AI makes work (apart from software development) more productive.

Computer agents are the next step. I believe they will deliver on Jobs' vision, dramatically increasing the computer capabilities available to the average non-technical person.

That's why I spent the past three months focused on building with computer agents. If you can empathize with non-technical users and their problems, you should too.

## Picking problems

So you're building with computer agents. Now what? You're in the idea maze. The technology changes quickly. How do you know the problem you pick today will still be worth solving tomorrow?

I propose looking for problems with the following three characteristics. Problems that will remain worthwhile solving even as computer agents and frontier AI models continue to get exponentially more capable.

### 1. Elapsed time, not inference time

The latest METR benchmark showed Opus 4.6 reliably completing half of the tasks that take human experts twelve hours to do. This exponential trend shows no sign of slowing. Given enough inference time, it's possible that future frontier models will one-shot any valuable knowledge work done today.

I propose to look instead for problems where best practices must be consistently applied over real world, elapsed time. These are problems that more inference and compute alone cannot one-shot.

### 2. Learnings that don't generalize

Frontier labs will keep vacuuming up training data from every valuable domain. Frontier models will continue to get smarter, both in terms of general learning ability and domain specific knowledge.

I propose to seek out problems where the learnings are personal to a person, a team, or a company. Think accumulated scar tissue, tribal knowledge, decisions made for reasons only your organization can understand. These learnings don't generalize to others. In fact, trying to apply them elsewhere might even be disastrous.

### 3. An apple a day

It's common to use a "model council." We ask several models to complete the same task, then either select the best work ourselves, or let another model decide. This might eke out higher quality output, but with quickly diminishing marginal returns. Model outputs tend to converge over just a few tries.

I propose to find problems where consistent, repeated practice produces markedly different and better results. Problems where a minor difference in data, context, or recent decisions leads to a completely different set of outcomes. Problems where the habit of doing something regularly is what makes a difference.

## Harnesses help

You're building with computer agents. You've picked a problem that needs best practices consistently applied over a period of real time, with personal learnings and where the habit of repetition matters. Here's how a harness can help.

There are several "agent harnesses" on the market. They all have a similar set of features. I'd like to focus on three features that particularly help with solving problems with the characteristics we described.

### Auditable artifacts

We want to apply best practices to solve a problem consistently over time. For a given domain, there will be primitives, artifacts, and types best suited to the task at hand. You want to trace how they are created, edited, and updated over time — whether by humans or, more likely, by AI agents.

Harnesses have hooks. Hooks make it easy to bake deterministic rules and guardrails into the agent's execution path. We can enforce access permissions, validate the agent's work, and provide feedback to the agent directly and automatically within its workflow.

### Predictable performance

Like human employees, we want agents that finish their work at an acceptable quality, within a reasonable time and budget. Like humans, agents also excel when the potential solution space is constrained rather than open-ended.

Harnesses have a built-in file system toolkit. The tools are few, general, and well understood. We can easily understand if an agent has read and researched the relevant context for its task, or whether it has completed editing the files it's supposed to. When our solution behaves predictably, it's easier to justify the time and budget needed to run the task in the first place.

### Designed for agents

We are deep into automation now. As agents work, the volume of output increases exponentially, far beyond what any human supervisor would track or manage. Our daily active users are agents, not humans.

Harnesses make it easier to develop an interface purpose-built for agents. One example pattern that has emerged is to use a CLI. Think of it as onboarding. If your solution lacks an agent-native interface, it won't be able to provide its full value proposition to an autonomous agent, no matter how good the underlying solution is.

## In practice

While the underlying technology continues to evolve, the industry has started to settle on some common patterns and features. When "harness engineering", we should focus on best applying these patterns to solving the problems we have defined.

{% panzoom src="harnesses-help.svg" alt="Use out-of-the-box harness features to get auditable artifacts and predictable performance." /%}

How to design a software interface for agents could be its own essay. One emerging pattern is to create a [Unix-style CLI](https://x.com/yan5xu/status/2031969426124521506), purpose-built for agent use.

{% panzoom src="cli-in-practice.svg" alt="Design interfaces that progressively disclose commands, tools, and follow-up actions, and clearly reports errors, duration, cost, and artifacts." /%}

## Feeding computer agents

Computer agents are having a moment. Claude Code was a revolution. But far more lives and jobs will be changed by computer agents designed for the average non-technical person. This new form factor has started to emerge in projects like OpenClaw, Manus, and Claude Cowork. Eventually, everyone who uses a computer or smartphone will use some kind of computer agent daily.

Like harnesses, these computer agent sandboxes also share an emerging set of patterns and features. We should also leverage them to best solve the defined user problem.

{% panzoom src="with-computer-agent.svg" alt="Building software used by computer agents with a harness." /%}

The end user relies on their capable computer agent for day to day tasks. That computer agent relies on your solution to execute best practices consistently over a long, real-time duration - with auditable artifacts, predictable performance, and an interface purpose-built for its use.

What does commercialization look like? Frankly, I don't have a concrete answer yet. But I see a few paths. One provides value-add services for enterprises with larger, more complex workloads that still require occasional human oversight. Two trains vertical expert models on verifiable outcomes of the chosen problem. Three buys the service businesses that have solved the chosen problem in the past.

Are you good at understanding how non-technical people do their job? Then build software for computer agents.
