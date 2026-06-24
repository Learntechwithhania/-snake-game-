# AI Prompting Lab Report - 13 Core Concepts

## Executive Summary

This report provides a comprehensive overview of the AI Prompting Lab, a 2-hour hands-on course designed to teach fundamental AI prompting techniques. The lab consists of 13 practical exercises that work with any major AI platform (ChatGPT, Claude, or Gemini) and is suitable for beginners while offering value for experienced users.

**Core Philosophy:** "Get the right context in, keep the wrong context out."

---

## Lab Structure

The lab is organized into four main parts:

1. **How AI Knows Things** (Exercises 1-3)
2. **Talking to AI Well** (Exercises 4-7)
3. **Beyond Text** (Exercises 8-10)
4. **Working Safely & Choosing Tools** (Exercises 11-13)

---

## Part 1: How AI Knows Things

### Exercise 1: Novice vs. Power User

**Objective:** Demonstrate the impact of context on AI responses.

**Key Learning:**
- Generic questions produce vague, generalized answers
- Context-rich prompts with specific constraints yield precise, actionable results
- Adding details like budget, use case, and preferences transforms response quality

**Example Application:**
- Instead of: "What laptop should I buy?"
- Try: "I need a laptop for video editing, budget $1500, prefer lightweight, must have 16GB RAM"

### Exercise 2: Knows vs. Guesses

**Objective:** Distinguish between confident responses and actual knowledge.

**Key Learning:**
- AI can sound confident even when uncertain
- Well-established facts are handled differently than recent/local information
- Important to test whether AI admits gaps in knowledge or fabricates answers
- Recent events or local information may require web search capabilities

**Practical Implication:**
Always verify critical information, especially for:
- Recent events (last few months)
- Local information (specific locations)
- Specialized technical details

### Exercise 3: The 3 Retrieval Modes

**Objective:** Understand how prompt wording activates different AI capabilities.

**The Three Modes:**

1. **Pretrained Knowledge (Memory-based)**
   - Fast, instant responses
   - Based on training data
   - Best for general knowledge, concepts, coding patterns

2. **Web Search (Current Information)**
   - Retrieves real-time data
   - Best for recent events, current prices, news
   - Activated by specific phrasing

3. **Deep Research (Structured Reports)**
   - Comprehensive analysis with citations
   - Multiple source verification
   - Structured output with references

**Key Insight:** Your wording determines which mode activates - choose deliberately.

---

## Part 2: Talking to AI Well

### Exercise 4: Context Is Everything

**Objective:** Master the essential prompt structure.

**Recommended Template:**
```
Task: [Clear statement of what you need]

Context:
- Fact 1: [Relevant background]
- Fact 2: [Important constraint]
- Fact 3: [User preference/requirement]

Desired Output: [Specific format you want]
```

**Key Learning:**
- Clear framing beats elaborate wording
- Structure matters more than length
- Specific output format requests improve results dramatically

### Exercise 5: Think Hard

**Objective:** Leverage AI reasoning capabilities for complex decisions.

**When to Use:**
- Multi-factor decisions with trade-offs
- Comparing multiple options
- Analyzing edge cases

**Best Practices:**
- Request structured output (ranked options, reasoning, pros/cons)
- Ask for explicit trade-off analysis
- Avoid conversational prose when you need analytical depth

**Example Prompt:**
"Compare these 3 cloud providers for my use case. Provide: 1) Ranked recommendations, 2) Reasoning for each, 3) Edge cases to consider. Think step-by-step."

### Exercise 6: Stop the Flattery

**Objective:** Prevent AI agreement bias through neutral phrasing.

**Problem:** Leading questions cause AI to agree rather than think critically.

**Leading (Bad):** "Don't you think X is the best approach?"
**Neutral (Good):** "Compare approaches X, Y, and Z. What are the strengths and weaknesses of each?"

**Key Learning:**
- Neutral phrasing yields balanced, thoughtful responses
- AI can be influenced by question framing
- Ask for multiple perspectives explicitly

### Exercise 7: The Brainstorm-Iterate Loop

**Objective:** Use iteration to produce superior results.

**Three-Round Process:**

**Round 1: Diverge**
- Request multiple options (5-10)
- Ask for variety without detailed explanations
- "Give me 8 different approaches to [problem]"

**Round 2: Refine**
- Provide feedback on initial options
- Request variations on promising directions
- "I like options 2 and 5. Give me 3 variations of each"

**Round 3: Expand**
- Fully develop the winning option
- Request implementation details
- "Take variation 5B and create a complete implementation plan"

**Key Insight:** Iteration beats single-pass answers. Don't settle for the first response.

---

## Part 3: Beyond Text

### Exercise 8: Multimodal – Image & Audio

**Objective:** Leverage AI's ability to process non-text inputs.

**Practical Applications:**
- Upload receipts for expense tracking
- Photograph handwritten notes for transcription
- Capture whiteboard sessions for summarization
- Convert audio recordings to text

**Best Practices:**
- AI handles bulk transcription reliably
- User should verify flagged details or ambiguous elements
- Good for data extraction, not for nuanced interpretation

**Use Cases:**
- Meeting notes from photos
- Receipt digitization
- Whiteboard capture
- Handwritten text extraction

### Exercise 9: Build a Small App

**Objective:** Generate functional tools through clear specification.

**Effective Structure (Goal/Input/Output):**

```
Goal: Create a [specific tool]
Input: User provides [what data]
Output: Display [what result, in what format]
```

**Examples:**
- Tip calculator with custom percentages
- Countdown timer with alerts
- Unit converter
- Simple data validator

**Key Learning:**
- Start simple, iterate to add features
- Request working code that can run immediately
- Test and provide feedback for refinement
- AI can generate HTML/CSS/JavaScript apps instantly

### Exercise 10: Data Analysis

**Objective:** Ensure accurate calculations by requiring code visibility.

**Critical Phrase:** "Write and run code, show me the code"

**The Problem:**
- AI may silently fail at calculations
- Confident answers can mask computational errors
- Without code visibility, you can't verify correctness

**The Solution:**
Always request:
1. Written code that performs the calculation
2. Execution of that code
3. Display of both code and results

**Example:**
"Analyze this dataset [attach file]. Write and run Python code to calculate the median, mean, and standard deviation. Show me the code and the results."

---

## Part 4: Working Safely & Choosing Tools

### Exercise 11: Desktop Apps & Permissions

**Objective:** Establish safe workflows when AI has file system access.

**Safe Workflow:**

1. **State the Task**
   - Clear description of what you want to accomplish
   - "I need to organize these photos by date"

2. **Request a Plan**
   - "Create a detailed plan before making any changes"
   - Review what the AI intends to do

3. **Review Carefully**
   - Check for deletion risks
   - Verify overwrite scenarios
   - Understand scope of changes

4. **Approve Explicitly**
   - Only proceed after reviewing the plan
   - "Proceed with the plan" as confirmation

**Critical Warnings:**
- Deletion cannot be undone
- File overwrites are permanent
- Start with minimal permissions
- Expand access only as needed
- Always backup important data first

**Best Practice:** Use read-only mode until you've verified the AI's approach.

### Exercise 12: Which Model When

**Objective:** Understand that different AI models have different strengths.

**Key Finding:** "Jagged Capability Frontier"
- No single model excels at everything
- Performance varies dramatically by task type
- Same prompt yields different results across platforms

**Recommended Approach:**
1. Run identical prompts on 2-3 different platforms
2. Document which performs better for your use case
3. Match future tasks to the best-performing model
4. Maintain a personal "model selection guide"

**Task-Specific Considerations:**
- Creative writing: [Model A might excel]
- Code generation: [Model B might be better]
- Data analysis: [Model C might be optimal]
- Research synthesis: [Compare all three]

**Action Item:** Create your own comparison matrix for tasks you do frequently.

### Exercise 13: Models Checking Models

**Objective:** Use cross-model verification for quality assurance.

**Process:**
1. Generate content with Model A
2. Have Model B (different family) review it
3. Have Model A review the same content
4. Compare the feedback from both

**What This Reveals:**
- Blind spots one model catches that another misses
- Different perspectives on the same content
- Quality issues that might be model-specific

**Best Practice for Critical Work:**
- Write with your preferred model
- Review with a different model family
- Synthesize feedback from both
- Apply improvements

**Example Application:**
"Review this 200-word executive summary. Identify: 1) Clarity issues, 2) Missing information, 3) Logical gaps, 4) Suggestions for improvement."

---

## Key Takeaways & Best Practices

### Fundamental Principles

1. **Context Determines Quality**
   - More relevant context = better answers
   - Structure your prompts: Task → Context → Output Format
   - Exclude irrelevant information

2. **Confidence ≠ Correctness**
   - AI can sound certain while being wrong
   - Always verify critical information
   - Request code for calculations to ensure accuracy

3. **Prompt Wording Selects Processing Mode**
   - Generic questions → generic answers
   - "Current" or "latest" → web search mode
   - "Research" with citations → deep analysis mode

4. **Neutral Phrasing Beats Leading Questions**
   - Avoid agreement bias
   - Request multiple perspectives
   - Use comparative analysis language

5. **Iteration Beats Single-Shot Answers**
   - Use the brainstorm-iterate loop
   - Refine through multiple rounds
   - Don't settle for first response

### Technical Best Practices

6. **Always Verify Code Blocks Exist**
   - Request "write and run code, show me the code"
   - Don't trust calculated results without seeing the method
   - Code visibility enables verification

7. **Compare Cross-Model Outputs for Critical Work**
   - Different models have different strengths
   - Use model checking model technique
   - Maintain awareness of jagged capability frontiers

8. **Work Safely with File Access**
   - Request plans before execution
   - Review for deletion/overwrite risks
   - Start with minimal permissions
   - Backup important data

### Professional Application

9. **Build a Personal Prompting Library**
   - Document what works for your use cases
   - Create templates for common tasks
   - Note which models perform best for what

10. **Leverage Multimodal Capabilities**
    - Upload images instead of typing data
    - Use photos for quick transcription
    - Combine text and visual inputs

11. **Generate Functional Tools**
    - Use Goal/Input/Output structure
    - Start simple, iterate to improve
    - Create custom utilities as needed

12. **Adopt Systematic Quality Assurance**
    - Plan → Review → Approve for risky operations
    - Cross-model verification for important content
    - Code visibility for all calculations

---

## Practical Implementation Checklist

### For Every Significant Prompt:

- [ ] Did I provide clear task statement?
- [ ] Did I include relevant context (3+ facts)?
- [ ] Did I specify desired output format?
- [ ] Am I using neutral phrasing?
- [ ] Should I iterate rather than accept first answer?

### For Code and Calculations:

- [ ] Did I request "write and run code, show me the code"?
- [ ] Can I verify the methodology?
- [ ] Should I test with sample data first?

### For File Operations:

- [ ] Did I request a plan first?
- [ ] Did I review for deletion/overwrite risks?
- [ ] Do I have backups?
- [ ] Are permissions minimal?

### For Critical Work:

- [ ] Should I compare multiple models?
- [ ] Should I use cross-model verification?
- [ ] Have I verified rather than trusted?

---

## Conclusion

The AI Prompting Lab provides a systematic framework for effective AI interaction. By understanding how AI retrieves information, structuring prompts clearly, leveraging multimodal capabilities, and working safely, users can dramatically improve their results.

The central insight remains: **get the right context in, keep the wrong context out.** Combined with iteration, neutral phrasing, code verification, and cross-model comparison, these techniques enable professional-grade AI-assisted work.

Success with AI is not about finding magic prompts - it's about understanding the system's capabilities, providing appropriate context, and verifying outputs systematically.

---

## Additional Resources

**Source Material:**
- Repository: panaversity/agentfactory-labs
- Path: AI-101/ai-prompting-in-2026/
- Files: ai-prompting-lab.md, ai-prompting-lab.pdf

**Recommended Practice:**
- Complete all 13 exercises hands-on
- Create personal templates for common tasks
- Build a model comparison matrix for your use cases
- Document what works in your specific domain

**Next Steps:**
1. Work through each exercise sequentially
2. Apply techniques to your actual work
3. Build your personal prompting library
4. Share learnings with your team

---

*Report Generated: June 19, 2026*
*Based on: AI Prompting Lab - 13 Core Concepts*
*Platform Agnostic: Works with ChatGPT, Claude, Gemini, and similar AI systems*
