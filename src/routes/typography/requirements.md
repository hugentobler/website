Services
Work
Writing
About
Contact
Hero Image
September 24, 2025
A new (or rather, old) approach to typography on the web
Typography serves language, not the convenience of a system.
~
The strongest type systems are specific, opinionated, and crafted with care for the context they serve.

~
For many designers, typography is a first love. In the pages of design books and type manuals, the environment feels steady. Columns, baselines, and margins hold firm. Letterforms lock into place, and paragraphs stay within their bounds.

The web plays by different rules. Sentences wrap unpredictably, and paragraphs break in unexpected places. To restore order, designers often reach for systemized solutions like 4px grids or component libraries. Design tools reinforce this reflex, rewarding what is easy to measure with neat numbers.

But typography has always lived beyond measurement. It rests on the eye: human perception, balance, and the subtle adjustments that quick calculations can't account for. Reduced to digital conveniences, these nuances are often lost, and with them the legibility typography is meant to sustain.

That gap between what typography needs and what these abstracted systems offer is where our work began. This is the story of how we designed Atlas, a type system for Adaline.

Balancing texture and tone
Testing Akkurat for clarity in real reading conditions
Adaline's interface relies heavily on text readability. As a prompt engineering tool, the smaller base size dominates the interface, serving as an anchor that guides the rest of the type system.

We began by studying the brand's typeface, Akkurat, and comparing it with a common web font like Inter. That comparison revealed key differences:

A lower x-height and smaller cap height, which makes it appear visually smaller at the same point size.
More intricate glyphs, which required additional space to maintain legibility, especially in tighter settings.

Comparing Akkurat to Inter
In typical viewing conditions (standard screen distance, 100% zoom), Akkurat felt spotty and hard to parse. Especially at smaller sizes, its lower x-height and compact counters created an uneven colour and visual crowding.

We stress tested a range of size and leading combinations across to rebalance the tone. Increasing line height alone lightened the weight but left passages feeling loose and disconnected. Reducing type size compromised legibility, while increasing it without adjusting leading only intensified the density.

Stress testing size and leading combinations to find ideal balance
The most effective solution proved subtle: nudging the base size up by a single pixel and loosening the leading proportionally. This opened the counters, restored rhythm between lines, and produced an optically balanced solution that held up across contexts.


Benchmarking Akkurat and making adjustments to achieve optical clarity in body text.
Subtle as they are, these pixel-level shifts help maintain the font's character and improve readability where it matters most.

Establishing vertical rhythm
Creating a modular spacing system that locks text to a consistent grid
Vertical rhythm is the spacing that carries the reader's eye down the page. Just as letter and word spacing shape how text reads across a line, vertical rhythm shapes how lines and paragraphs connect in sequence. Done well, it gives the composition a sense of balance and harmony. Done poorly, it creates uneven spacing that makes reading jarring.

To create a vertical rhythm for Atlas that felt both structured and flexible, we began by defining a fixed vertical measure that every type size would relate back to. Every line of text, from body copy to headlines, would align to it in some consistent way.

Finding a repetition unit with the right balance of texture and contrast was a process of meticulous iteration. We tested numerical heights, looking for one that would subdivide cleanly across sizes without producing awkward decimals.

The outcome was a unified baseline grid supported by a modular spacing system. Each size scales in proportion, ensuring consistency, while the grid's rhythm keeps the overall cadence balanced and harmonious.


The repetition unit and grid in practice: a framework that organizes both type and composition.
Bringing baselines to the web
Designing a system that accounts for ascender and descender space in CSS rendering
In traditional typography, leading is the space measured from one baseline to the next. This clean, predictable unit gives text a consistent rhythm.

On the web, line height is calculated from the font's bounding box, which introduces extra space above ascenders and below descenders.

A comparison between print and web on how line spacing is calculated.
Since most websites rely on flex alignment to position text, the extra space means alignment is based on the bounding box rather than the baseline. As a result, type rarely sits on a true baseline and often appears to “float” within its container.

You can see this even on well-known sites like Linear: the text is technically aligned in CSS, yet the baselines don't line up, creating a subtle but noticeable disconnect. A proposed CSS property, text-box-trim, could address this issue, though it isn't widely supported yet.

Linear's landing page aligns the bounding box, not the text itself.
To resolve the problem of imprecise digital alignment, we built the system around the letterforms themselves rather than relying on CSS workarounds. By carefully tuning the font size and line height, we aligned the baseline and cap height cleanly to our grid while still accounting for the extra space above ascenders and below descenders.

Nudging size and line height to find the exact type size that optically aligns with the grid.
The result is a type system that embraces the web's constraints, achieving optical precision while staying fully aligned with standard css practices. It maintains both visual balance and technical integrity so that every element always locks into place with a consistent rhythm.


A view of the type system showing how each size aligns seamlessly to the grid.
The type system extended into the product's design system as a framework for alignment. Icons and checkboxes were now anchored to the baseline line height, ensuring consistent alignment across every component.


Using a design system token to align with the baseline line height.
Naming the tokens
Decoupling names from function to let type scale freely across contexts
Names carry weight. They can either clarify or constrain. When type systems assign semantic labels like “heading” or “body”, the type size gets tied to a role. Large text can only ever be a header, and small text only ever the body.

Instead of assigning semantic labels, we adopted a Tailwind-inspired “t-shirt sizing” model: xs, sm, base, md and lg. These sizes describe visual scale rather than function, freeing designers to choose what feels right in context.


Avoiding prescriptive names, a lg token could just as easily define a page title as a featured stat. A sm token might become a caption or a callout in a card. Even xs can find versatility in tighter spaces. The point isn't to follow the name, but to serve the purpose of the content.

Within the Monitor tab in the Adaline product, type scales flex to serve intent, composition and hierarchy.
By decoupling scale from function, the system avoids the rigidity that often forces teams to shoehorn typography into mismatched roles. This flexibility becomes especially critical when it comes to responsive design, where the same content may require different type treatments across breakpoints, or in accessibility, where considerations around assistive tech or additional user preferences may come into play. In any case, it helps to solidify clarity and consistency for all users.

A type system that knows its place
Typography's role is to serve meaning, not convenience
Typography is still one of design's most overlooked tools within the web and digital products. It's too often reduced to a tidy set of tokens and ratios built to ship fast. But no formula is universal. Different products, with different constraints, demand systems that are tailored to their context.

The strongest type systems are opinionated. They respond thoughtfully to the environment they inhabit, carrying a voice that cannot be captured by easy standardization. Crafted with care, they open a rich visual dialogue between words, meaning, and the reader.

Atlas is specific to Adaline, and it is that specificity that makes it work well. In a product designed around language, that makes all the difference.

Division of product design and engineering, Daybreak Studio

72 Stafford St, Suite 400, Toronto ON M5V 2V9

Design and Writing
Alvin Leung

Taha Hossain

Shen Gao

Ben Giannis

Motion Design
Rafi Rizky

Close
