   # EO-001 — Business Understanding

   **Opportunity:** EO-001 — Add Ladder-Climbing Enemy
   **Lifecycle Stage:** Business Clarification
   **Conversation:** CONV-002 — Business Clarification
   **Role:** ROLE-001 — Business Analyst
   **Started:** 2026-08-06
   **Completed:** 2026-08-06
   **Status:** ✅ Complete — 19 business decisions resolved, 0 open

   > **Purpose.** To identify and record every **business** decision that must be
   > made before architecture can begin. This document contains no design and no
   > implementation. Technical questions are explicitly out of scope for this
   > conversation and are tracked separately in
   > `current-system-understanding.md` §18.
   >
   > **Method.** One question at a time. This document is updated after every
   > answer. Clarification stops when every decision below is either **Decided** or
   > explicitly **Deferred**.

   ---

   ## 1. Already answered by discovery — not to be re-asked

   These appear as Open Questions in `opportunity.md` but were settled factually
   during CONV-001. They are recorded here so the business conversation does not
   spend time on them.

   | opportunity.md Q | Question | Finding |
   |---|---|---|
   | 1 | Does the game already contain ladders? | **No.** None exist in any form. (CSU §7) |
   | 2 | How are ladders currently represented? | **Not applicable** — there is nothing to describe. (CSU §7) |
   | 3 | Can the player currently climb ladders? | **No.** Vertical movement is jumping only. (CSU §7) |
   | 4 | How are upper and lower levels represented? | As a **flat array of rectangles**. There is no modelled concept of a "level" or "floor". (CSU §5) |
   | 5 | How do enemies determine where the player is? | Directly, from `player.x`, with a **hard 120px vertical awareness limit**. (CSU §4.1) |
   | 6 | Do enemies use states such as idle/chase/attack? | **Yes** — five states: idle, chase, telegraph, attack, recover. **No jump, fall, or climb state.** (CSU §3) |
   | 7 | Is there existing navigation or pathfinding? | **No.** None of any kind. (CSU §4.3) |
   | 20 | Is automated testing available? | **No.** No tests, runner, linter, or CI exist. (CSU §11) |

   **The business-critical consequence of finding 5:** every platform in the shipped
   level sits 128–196px above the road, and the awareness limit is 120px.
   **Standing on any platform currently makes the player invisible to all four
   enemy types.**

   ---

   ## 2. Business Decision Register

   Status: 🔴 Open · 🟢 Decided · ⚪ Deferred

   | ID | Business decision | Status |
   |---|---|---|
   | BD-001 | Whose behaviour may change: only the new enemy, or existing enemies too? | 🟢 **Decided** |
   | BD-002 | Should the player also be able to climb ladders? | 🟢 **Decided** |
   | BD-003 | What is the primary success measure — denying safe ground, or adding variety? | 🟢 **Decided** |
   | BD-004 | Should the enemy always pursue upward, or only under certain conditions? | 🟢 **Decided** |
   | BD-005 | May the enemy attack while climbing? | 🟢 **Decided** |
   | BD-006 | May the enemy be damaged or killed while climbing, and what happens when it dies mid-climb? | 🟢 **Decided** |
   | BD-007 | Should the enemy descend as well as ascend? | 🟢 **Decided** |
   | BD-008 | What should happen if the player leaves the upper level mid-climb? | 🟢 **Decided** |
   | BD-009 | Should ladders be visible and obvious to the player as a game feature? | 🟢 **Decided** |
   | BD-010 | Should the new enemy be visually distinct from existing enemies? | 🟢 **Decided** |
   | BD-011 | What threat profile should it carry — which weapon, how dangerous? | 🟢 **Decided** |
   | BD-012 | Where should it appear in the wave progression? | 🟢 **Decided** |
   | BD-013 | What fairness guardrails must hold (must the player always be able to escape or win)? | 🟢 **Decided** |
   | BD-014 | How will we judge, in gameplay terms, that this succeeded? | 🟢 **Decided** |
   | BD-015 | What validation is acceptable, given no automated tests exist? | 🟢 **Decided** |
   | BD-016 | Is this for the one existing level only, or a reusable capability? | 🟢 **Decided** |
   | BD-017 | Are there schedule or priority constraints? | 🟢 **Decided** |
   | BD-018 | Who signs off on the gameplay result? | 🟢 **Decided** |
   | BD-019 | May the composition of existing waves change, or must the climber be added without altering them? | 🟢 **Decided** |

   ---

   ## 3. Decisions Confirmed

   ### BD-001 — Only the new climbing enemy may change behaviour 🟢

   **Decision.** The four existing enemy types (knifeman, swordsman, gunman, archer)
   keep their current behaviour exactly. They continue to ignore a player standing
   on an elevated platform. **Only the new climbing enemy gains awareness of, and
   the ability to pursue, a target on an upper level.**

   **Business rationale.** Preserves the Opportunity's stated constraint that
   existing enemies continue behaving as they currently do, and keeps the change
   contained to one new, opt-in threat rather than a game-wide difficulty shift.

   **Business consequences — recorded so they are not discovered late:**

   1. **Elevated ground remains safe from four of the five enemy types.** A player
      on a platform is still invisible to knifeman, swordsman, gunman and archer.
      The Opportunity's expected value "make elevated platforms less safe" is
      therefore delivered **only where the new enemy is present in a wave.** If a
      wave contains no climbing enemy, platforms remain a complete refuge.
   2. **The new enemy becomes the sole answer to platform camping.** Its placement
      in the wave list (BD-012) directly determines whether that expected value is
      realised at all.
   3. **The shared 120px awareness limit cannot be raised globally.** Any
      upper-level awareness must be specific to the new type. This answers
      CSU §18.1.1: the shared gate may **not** be changed in a way that alters
      existing enemies.
   4. **Difficulty impact is additive, not systemic** — the game gets harder only
      when the new type is on screen.

   ### BD-002 — Ladders are enemy-only; the player keeps jumping 🟢

   **Decision.** Ladders are enemy infrastructure. The player continues to reach
   elevated platforms by jumping and **cannot climb**. No new player movement mode
   is introduced.

   **Business rationale.** Keeps the change to a single new enemy capability, in
   line with the Opportunity's scope, and avoids altering how the player moves
   through every level.

   **Business consequences:**

   1. **Accepted usability cost.** A visible ladder that the player cannot use will
      read as broken to some players. This is a knowingly accepted trade, not an
      oversight.
   2. **BD-009 becomes more consequential.** How this object is presented now
      matters more: an object that looks like a conventional climbable ladder
      invites an interaction that does not exist. Presenting it as enemy
      infrastructure the player is not expected to use may avoid the false
      affordance. This is now a live design decision, not a cosmetic one.
   3. **No change to player traversal, so no regression risk to player movement.**
   4. **Asymmetry is permanent unless revisited.** The player and the new enemy
      reach the same places by different means.

   ### BD-006 — Fully vulnerable while climbing; falls to the ground when killed 🟢

   **Decision.** The climbing enemy takes damage normally throughout the climb,
   under the same rules as every other enemy. If killed mid-climb it **detaches
   from the ladder and falls**, dying on the ground where it lands.

   **Business rationale.** The climb is a deliberate **window of risk**. A player
   who notices the ladder and watches it is rewarded for punishing the climb. Death
   behaviour stays consistent with every other enemy, so nothing new has to be
   learned or explained.

   **Business consequences:**

   1. **The player has clear counter-play.** Climbing is a commitment the player can
      punish, which is what keeps the new threat from feeling arbitrary.
   2. **No special damage rules.** The new enemy uses existing combat behaviour
      unchanged, satisfying Success Criterion 9 (existing weapons damage it under
      current rules) without exception.
   3. **Falling bodies are expected and normal-looking** — consistent with how all
      deaths already read.
   4. **A camping risk to watch:** if the player can stand at the top of a ladder
      and kill every climber trivially, the threat is neutralised and the feature
      delivers little. Whether that is acceptable, or needs a guardrail, is
      deferred to **BD-013**.

   ### BD-005 — No attacking while on the ladder 🟢

   **Decision.** The climbing enemy cannot attack at any point while on the ladder.
   It resumes normal combat only after leaving the ladder at the top.

   **Business rationale.** Keeps the climb readable: it is unambiguously a moment of
   exposure for the enemy and safety for the player. Preserves the game's existing
   principle that every attack is preceded by a visible wind-up, which a
   one-handed mid-climb attack would undermine.

   **Business consequences:**

   1. **The enemy's value is arrival, not the climb.** The threat it adds is that it
      *reaches* the player's level — the journey itself contributes no pressure.
   2. **The climb is now entirely in the player's favour.** Combined with BD-006, a
      climbing enemy is damageable and harmless for the whole climb. This is a
      deliberate risk/reward moment, but it **compounds the camping concern** and
      makes BD-013 a required decision rather than an optional one.
   3. **While an enemy is climbing, the player is safe from it** — creating a
      deliberate tactical window to reposition or deal with other enemies.

   ### BD-013 — Ladder-top camping is acceptable; no guardrail 🟢

   **Decision.** A player who camps the top of a ladder and kills each climber as it
   arrives is playing legitimately. **No rule is added to prevent, punish, or
   outsmart this.** The climbing enemy does not avoid a defended ladder, is not made
   tougher to compensate, and arrival carries no special threat.

   **Business rationale.** Camping is a reward for reading the situation correctly.
   The enemy's pressure comes from arriving *while the player is occupied with
   other threats*, not from winning a one-on-one ladder duel.

   **Business consequences — the most important in this document:**

   1. **The feature's value is entirely dependent on context.** A climbing enemy
      fought alone is a free kill by design. It only creates pressure when the
      player is simultaneously dealing with something else.
   2. **BD-012 (wave placement) therefore determines whether this opportunity
      delivers any value at all.** This is now the single highest-stakes remaining
      business decision. Placed alone in a wave, the feature is pointless; placed
      alongside other enemies, it works as intended.
   3. **Accepted risk:** a player who never leaves the ladder top may perceive the
      new enemy as trivial and the feature as unnecessary. Accepted knowingly.
   4. **No new fairness rules** means no new ways for the game to feel arbitrary,
      and nothing extra for the player to learn.

   ### BD-012 — Introduce alone first, then reuse under pressure 🟢

   **Decision.** The climbing enemy is introduced **by itself in a mid wave**, so the
   player can see what it does and learn that ladders matter. It then **returns in
   later waves alongside other enemies**, where it applies genuine pressure.

   **Business rationale.** The mechanic has to be taught before it can be used
   against the player. A first encounter that is calm and observable makes every
   later encounter legible.

   **Business consequences:**

   1. **The introduction encounter is deliberately a free kill.** Per BD-013 that is
      expected and correct — its job is to teach, not to threaten. It should not be
      judged a failure for being easy.
   2. **At least one ladder must exist in the shipped level**, positioned so the
      introduction is actually visible to the player rather than happening offscreen.
   3. **Later waves become harder** by gaining an additional threat. Whether that
      added difficulty is absorbed by *adding* to existing waves or by *substituting*
      within them is a separate decision — raised as **BD-019**.
   4. **This is a change to shipped level content**, not only new code. Existing
      wave composition is affected, which the Opportunity did not anticipate — its
      §Known Dependencies does not mention `phefo/js/levels/` at all.

   ### BD-019 — Add the climber on top; later waves get harder 🟢

   **Decision.** The climbing enemy is **added** to the later waves without removing
   any existing enemy. Those waves gain an additional threat and become measurably
   harder than they are today.

   **Business rationale.** Delivers the most pressure and the clearest escalation,
   and keeps the existing enemy mix intact rather than making an existing type
   appear less often.

   **Business consequences:**

   1. **Late-game difficulty rises deliberately.** This is an intended balance
      change, not a side effect.
   2. **Modifying `phefo/js/levels/level01_city.js` is explicitly authorised**,
      including its `waves` data.
   3. **A concrete acceptance test now exists** for the Opportunity's constraint
      that the change "should not make gameplay unfair or impossible": **the final
      wave, with the climber added, must remain winnable.** This must be
      demonstrated before release — see BD-015.
   4. **Returning players will notice.** The late game is not as they left it, by
      design.

   ### BD-011 — Fast, fragile melee; knife-armed 🟢

   **Decision.** Once it reaches the player's level the climber fights as a **fast,
   lightly-armoured melee enemy carrying a knife** — the lowest-weight threat
   profile in the game.

   **Business rationale.** Agility is consistent with something that climbs, and it
   is the profile least likely to overshoot difficulty at a point where the late
   waves are already becoming harder under BD-019.

   **Business consequences:**

   1. **No new weapon is required.** The existing knife is reused, keeping the change
      clear of the Opportunity's "no new weapons" boundary.
   2. **Its combat profile overlaps almost entirely with the existing knifeman.**
      The new type is differentiated by *how it arrives*, not by how it fights.
      **This makes BD-010 (visual distinctiveness) materially more important** — if
      the two look alike, players may never realise a new enemy type exists and may
      read the climb as a knifeman bug.
   3. **Modest difficulty impact per instance**, which suits adding it on top of
      existing waves.
   4. **Risk accepted:** once the novelty of the climb passes, an arriving climber
      plays exactly like an enemy the player already knows.

   ### BD-010 — Own colour, slightly smaller build 🟢

   **Decision.** The climber has its **own colour** and a **slightly smaller, lighter
   build** than the existing knifeman, reading as agile.

   **Business rationale.** Makes the new type immediately identifiable as something
   distinct, so the climb is attributed to a new enemy rather than misread as a
   knifeman malfunctioning. Uses only the differentiation the game already relies
   on — the four existing types differ by colour and scale alone.

   **Business consequences:**

   1. **No new art or rendering capability is needed.** Colour and scale are existing
      per-type settings.
   2. **Player comprehension is protected**, which matters because BD-011 left the
      two types combat-identical.
   3. **Minor balance side effect:** a smaller figure is a slightly smaller target,
      so the climber is marginally harder to hit than a knifeman. Judged acceptable
      given it is also the most fragile type.

   ### BD-009 — Ladders are clearly visible and obviously ladders 🟢

   **Decision.** Ladders are drawn unmistakably as ladders connecting the ground to a
   platform, plainly visible to the player.

   **Business rationale.** The player must be able to see how an enemy reached their
   platform and plan around it. Clarity of the enemy's route is judged more valuable
   than avoiding a false affordance.

   **Business consequences:**

   1. **The false affordance is now at its strongest.** An unmistakable ladder that
      the player cannot climb is the most likely single element of this feature to
      be **reported as a bug**. This is accepted deliberately, twice over (BD-002,
      BD-009), and support or feedback channels should expect it.
   2. **A new visual element is introduced to the level**, distinct from the
      existing solid and platform shapes.
   3. **The player can plan around ladders** — watch them, control them, or avoid
      platforms served by them. That is the intended tactical texture.

   ### BD-007 — Two-way: the climber descends as well as ascends 🟢

   **Decision.** If the player returns to ground level, the climber **climbs back
   down** and resumes the pursuit. Climbing is a two-way capability.

   **Business rationale.** The enemy should follow the player rather than lose
   interest, which is the behaviour that makes it read as intelligent — one of the
   Opportunity's stated business values.

   **Business consequences:**

   1. **This removes the most serious gameplay failure mode.** Because the climber
      can always come back down, it can never be stranded on a platform, so it can
      never block wave completion or make the game unfinishable. Discovery raised
      this as a soft-lock risk (CSU §17 R6); **this decision retires it at the
      business level.**
   2. **The player cannot escape by changing level.** Retreating up or down only
      buys time, which directly serves the Opportunity's goal of making elevated
      ground less safe.
   3. **New risk introduced — oscillation.** A player who moves up and down
      repeatedly could make the climber reverse on the ladder over and over,
      which would look foolish. How committed a climb should be is now a required
      decision — **BD-008**.
   4. **Descending is a second capability**, not a free by-product of climbing up.

   ### BD-008 — A climb, once started, always completes 🟢

   **Decision.** If the player changes level mid-climb, the climber **finishes the
   climb anyway** and only reconsiders once it arrives. Climbs are never abandoned
   part-way.

   **Business rationale.** Prevents oscillation on the ladder, and matches the
   game's existing principle that an enemy commits to an action once it has begun —
   the same rule that makes telegraphed attacks readable.

   **Business consequences:**

   1. **Oscillation is designed out.** The climber cannot yo-yo, however the player
      moves.
   2. **Accepted cost:** the enemy will sometimes be visibly climbing toward a place
      the player has already left, and will look briefly wrong-footed. Judged
      preferable to looking indecisive.
   3. **Combined with BD-005 and BD-006, a committed climb toward a departed player
      is a free kill for the player.** Consistent with BD-013 and accepted.
   4. **The player can bait a climb** — a deliberate tactic, and a positive one.

   ### BD-004 — Climbs only when a ladder is reasonably close 🟢

   **Decision.** The climber uses a ladder when one is **near its current position**.
   It does not cross the level in search of one; beyond that range it behaves as an
   ordinary ground enemy.

   **Business rationale.** Keeps the behaviour readable and consistent with how far
   existing enemies engage at all. An enemy marching past the player toward a
   distant ladder would look broken rather than intelligent.

   **Business consequences:**

   1. **The feature triggers less often**, and only near ladders. A player who
      retreats to a platform far from any ladder is effectively safe.
   2. **Ladder placement becomes a design requirement, not decoration.** Ladders must
      sit near where climbers appear and near the platforms players actually use, or
      the capability will rarely be seen. This compounds BD-012: the introduction
      wave must place a climber within range of a visible ladder.
   3. **"Reasonably close" needs a concrete value.** Business guidance: comparable to
      the engagement ranges existing enemies already use. The exact number is a
      tuning decision for implementation.
   4. **Combined with BD-001, the "elevated ground is less safe" value is now
      doubly conditional** — it applies only in waves containing a climber, and only
      near a ladder. This should be reflected in how success is judged.

   ### BD-003 / BD-014 — Judged on enemy variety and perceived intelligence 🟢

   **Decision.** The primary measure of success is that **the climber visibly and
   sensibly climbs, fights, and follows the player between levels without looking
   broken.** Acceptance is judged by observing the game.

   **⚠️ Formal amendment to the Opportunity.** `opportunity.md` §Expected Business
   Value lists "make elevated platforms less safe for the player". Under the
   decisions taken here that outcome is **conditional in three independent ways**:

   | Condition | Source |
   |---|---|
   | Only in waves that contain a climbing enemy | BD-001 |
   | Only near a ladder | BD-004 |
   | Only when the player is occupied by other threats | BD-013 |

   **"Elevated ground genuinely stops being safe" is therefore explicitly NOT a
   pass/fail acceptance criterion.** It is recorded as a partial, situational
   benefit. This was raised before acceptance rather than discovered at review, and
   the Project Owner chose enemy variety as the measure with this trade-off stated.

   **Business consequences:**

   1. **Acceptance is observational**, which suits a project with no automated tests
      and aligns with whatever is decided in BD-015.
   2. **"Looks broken" is the failure condition** — stuck enemies, enemies climbing
      toward nothing, jitter on the ladder, or a climb that reads as teleporting.
   3. **Reviewers must not fail the work for platform camping remaining viable.**
      That is a known and accepted outcome, not a defect.

   ### BD-015 — Written manual checklist, played through and recorded 🟢

   **Decision.** Validation is a **written, repeatable manual checklist**, played by
   hand, with the results recorded as Engineering Evidence. No automated test
   tooling is introduced.

   **Business rationale.** Matches the observational acceptance chosen in BD-014 and
   keeps scope on the enemy itself rather than on building test infrastructure the
   project has never had.

   **Required checklist coverage** (business-level; exact steps are for the
   implementation stage):

   1. The climber ascends and reaches the platform.
   2. It descends when the player returns to ground (BD-007).
   3. It can be killed mid-climb and falls (BD-006).
   4. It never attacks from the ladder (BD-005).
   5. A climb started is always completed (BD-008).
   6. It never becomes stuck, on the ladder or at either end.
   7. **Wave 5, with the climber added, is completed successfully** (BD-019).
   8. **Each of the four existing enemy types is observed behaving as before**
      (BD-001, Success Criterion 10).
   9. No new console errors (Success Criterion 11).

   **Business consequences:**

   1. **Accepted risk:** "existing enemies unchanged" rests on human observation
      rather than mechanical proof. Item 8 above exists specifically to reduce that
      risk, and it must not be skipped.
   2. **The checklist is itself a deliverable**, stored under `evidence/`, and is
      the artefact release approval is granted against.
   3. **The project remains without automated tests** — the same exposure exists for
      the next change.

   ### BD-016 — Ladders are a reusable, level-authorable feature 🟢

   **Decision.** Ladders become a **general level-design feature**, placeable in any
   level in the same way platforms are today — not a one-off fixture of the current
   level.

   **Business rationale.** Delivers the Opportunity's "reusable foundation" value,
   which was ranked second at BD-014, and avoids predictable rework when a second
   level is built.

   **Business consequences:**

   1. **Level designers gain a new authoring tool**, alongside solids and platforms.
      This affects the designer audience named in `opportunity.md` §Affected Users.
   2. **The generalisation stays unproven** until a second level exists. Success here
      is judged on the current level; reuse value is a forward bet.
   3. **Modest additional design care now**, in exchange for lower future cost.
   4. **Documentation for level authors** may be warranted so the feature is
      discoverable by whoever builds the next level.

   ### BD-017 — Single complete increment, no fixed deadline 🟢

   **Decision.** Everything ships together — the ladder feature, ascent, descent, the
   new enemy type, its wave placement, and the validation checklist — at a
   quality-first pace with no fixed date.

   **Business rationale.** Matches the Medium priority and avoids any partially
   delivered state.

   **Business consequences:**

   1. **Descent cannot be deferred.** Per BD-007, two-way climbing is what prevents
      enemies stranding on platforms and blocking wave completion. **Shipping ascent
      without descent would risk an unfinishable game and is explicitly not
      permitted**, under any phasing.
   2. **No date pressure** to trade against quality.
   3. **Architecture may plan a single delivery** rather than sequenced increments.

   ### BD-018 — The Project Owner approves all four gates 🟢

   **Decision.** The Project Owner grants all four required approvals — business,
   architecture, release and production deployment — and personally judges the
   gameplay result against the BD-015 checklist.

   **Business rationale.** Appropriate for a single-owner project, and keeps the
   judgement with whoever set the intent.

   **Business consequences:**

   1. **No independent review.** The person who set the goals also judges whether
      they were met, and the same person validates the "existing enemies unchanged"
      promise that manual testing already covers weakly (BD-015). Accepted.
   2. **No fresh-eyes play-test.** The failure conditions set in BD-014 — an enemy
      that "looks broken" — and the ladder false affordance (BD-009) are exactly the
      things a first-time player notices and a designer stops seeing. Accepted.
   3. **No approval scheduling dependency**; the work can be approved as soon as the
      checklist is complete.

   ---

   ## 4. Decisions Deferred

   _None yet._

   ---

   ## 5. Clarification Log

   | # | Question asked | Answer | Decisions affected |
   |---|---|---|---|
   | Q1 | When the player stands on an elevated platform, whose behaviour should change? | **Only the new climbing enemy.** Existing four unchanged. | BD-001 ✅ · constrains BD-003, BD-012 |
   | Q2 | Should the player be able to climb the ladders too, or are they enemy-only? | **Enemy-only.** Player keeps jumping; no new player movement mode. | BD-002 ✅ · sharpens BD-009 |
   | Q3 | Should the enemy be vulnerable while climbing, and what happens if killed mid-climb? | **Fully vulnerable; falls to the ground when killed.** | BD-006 ✅ · raises camping risk → BD-013 |
   | Q4 | May the enemy attack while it is on the ladder? | **No.** Climbing is a full commitment; it fights only after reaching the top. | BD-005 ✅ · makes BD-013 mandatory |
   | Q5 | Is free ladder-top camping acceptable, or should something prevent it? | **Acceptable.** No guardrail; camping is a legitimate reward for smart play. | BD-013 ✅ · makes BD-012 the highest-stakes open decision |
   | Q6 | Where should the climbing enemy appear in the wave progression? | **Introduce alone in a mid wave, then reuse in later waves alongside others.** | BD-012 ✅ · raises BD-019 |
   | Q7 | How should the climber be fitted into the later waves? | **Added on top.** Later waves gain an enemy and get harder. | BD-019 ✅ · creates acceptance test for BD-015 |
   | Q8 | What kind of threat should the climber be once it reaches the player's level? | **Fast, fragile melee, knife-armed.** No new weapon needed. | BD-011 ✅ · makes BD-010 materially more important |
   | Q9 | How visually distinct should the climber be from the knifeman? | **Own colour, slightly smaller build.** | BD-010 ✅ |
   | Q10 | How should the ladder be presented, given the player cannot use it? | **Clearly visible, obviously a ladder.** False affordance accepted. | BD-009 ✅ |
   | Q11 | What should the climber do if the player returns to ground level? | **Climb back down and keep pursuing.** Two-way capability. | BD-007 ✅ · retires soft-lock risk · raises BD-008 |
   | Q12 | If the player changes level mid-climb, should the climb be abandoned? | **No.** A climb always completes; the enemy reassesses on arrival. | BD-008 ✅ · oscillation designed out |
   | Q13 | How far should the climber travel to reach a ladder? | **Only if a ladder is reasonably close.** No cross-level pursuit. | BD-004 ✅ · makes ladder placement a design requirement |
   | Q14 | Which value should this be judged against at acceptance? | **Enemy variety and perceived intelligence.** "Less safe platforms" is explicitly not pass/fail. | BD-003 ✅ BD-014 ✅ · amends opportunity.md |
   | Q15 | What validation is acceptable before release? | **Written manual checklist, played through and recorded as evidence.** | BD-015 ✅ |
   | Q16 | Is this for the one existing level, or a reusable capability? | **Reusable** — ladders authorable in any level. | BD-016 ✅ |
   | Q17 | What delivery shape and schedule should this follow? | **One complete increment, no fixed deadline.** Descent may never be deferred. | BD-017 ✅ |
   | Q18 | Who approves the gameplay result? | **Project Owner approves all four gates.** | BD-018 ✅ |

   **18 questions asked · 19 business decisions resolved · 0 open.**

   ---

   ## 6. The Climbing Enemy in Business Terms

   A plain-language statement of what was agreed, assembled from the decisions
   above. This is the behavioural specification architecture must satisfy — it
   contains no design.

   > A new enemy type appears in the game, visibly distinct from the others by its
   > own colour and a smaller, lighter build. It fights like the existing knifeman —
   > fast, fragile, armed with a knife — but unlike any other enemy it can use
   > ladders.
   >
   > Ladders are drawn plainly as ladders, connecting the ground to a platform. The
   > player cannot use them; only this enemy can.
   >
   > When the player is on a platform above it and a ladder is reasonably close, the
   > climber goes to the ladder and climbs. Throughout the climb it cannot attack and
   > can be freely shot; if killed it falls to the ground and dies there. Once a
   > climb has begun it always finishes, whatever the player does. On arrival it
   > resumes fighting normally. If the player returns to ground level, it climbs
   > back down and continues the pursuit.
   >
   > It is introduced alone in a middle wave so the player can watch it work, and it
   > returns in later waves alongside other enemies, which become harder as a result.
   > No existing enemy changes in any way.

   ---

   ## 7. Consolidated Business Rules

   Testable statements derived from the decisions. These are what the BD-015
   checklist validates.

   | # | Rule | Source |
   |---|---|---|
   | BR-01 | The four existing enemy types behave exactly as they do today. | BD-001 |
   | BR-02 | Only the new enemy type can perceive and pursue a target on an upper level. | BD-001 |
   | BR-03 | The player cannot climb ladders. | BD-002 |
   | BR-04 | Ladders are drawn plainly and visibly as ladders. | BD-009 |
   | BR-05 | The climber takes damage normally at every point of a climb. | BD-006 |
   | BR-06 | Killed mid-climb, it detaches, falls, and dies on the ground. | BD-006 |
   | BR-07 | It never attacks while on a ladder. | BD-005 |
   | BR-08 | A climb, once begun, always completes. | BD-008 |
   | BR-09 | It climbs down as well as up, and can never be stranded. | BD-007 |
   | BR-10 | It uses a ladder only when one is reasonably close; it does not cross the level to find one. | BD-004 |
   | BR-11 | It fights as a fast, fragile, knife-armed melee enemy. | BD-011 |
   | BR-12 | It is visually distinct — own colour, slightly smaller build. | BD-010 |
   | BR-13 | It appears alone in a middle wave, then in later waves alongside other enemies. | BD-012 |
   | BR-14 | Later waves gain the climber in addition to their existing enemies. | BD-019 |
   | BR-15 | The final wave remains winnable. | BD-019 |
   | BR-16 | Ladders can be placed in any level, as platforms can. | BD-016 |
   | BR-17 | Ascent and descent ship together; descent is never deferred. | BD-017, BD-007 |
   | BR-18 | No new weapon is introduced. | BD-011 |

   ---

   ## 8. Amendments to opportunity.md

   Business decisions that change or qualify the Opportunity as written. **These
   require Project Owner acknowledgement before architecture begins.**

   | # | Opportunity says | Amended position | Source |
   |---|---|---|---|
   | A-1 | Expected value: "make elevated platforms less safe for the player" | **Not a pass/fail criterion.** Delivered only in waves containing a climber, only near a ladder, and only when the player is occupied. Recorded as a partial, situational benefit. | BD-003, BD-014 |
   | A-2 | Known Dependencies list `style.css` for "ladder and enemy presentation" | **Not applicable.** The stylesheet is page layout only; all game visuals are canvas drawing. | CSU §1 |
   | A-3 | Known Dependencies omit the levels module | **`phefo/js/levels/` is a primary dependency** — ladders, wave composition and enemy placement all live there. | CSU §0, BD-012 |
   | A-4 | Out of Scope: "changing existing enemy behaviour without explicit approval" | **Upheld.** No existing enemy changes; the shared awareness limit may not be raised globally. | BD-001 |
   | A-5 | Success Criterion 2: "enemy can identify that its target is on an upper accessible level" | **Qualified** — only when a ladder is reasonably close. | BD-004 |
   | A-6 | Open Question 20 asks whether automated testing is available | **Answered: no.** Validation is a recorded manual checklist. | CSU §11, BD-015 |
   | A-7 | Priority: Medium, schedule undefined | **Confirmed.** Single complete increment, no fixed date. | BD-017 |

   ---

   ## 9. Risks Accepted by the Business

   Knowingly accepted during this conversation. None is a defect.

   | # | Accepted risk | Source |
   |---|---|---|
   | AR-1 | A clearly-drawn ladder the player cannot use will be reported as a bug by some players. | BD-002, BD-009 |
   | AR-2 | Platform camping remains a viable way to avoid most enemies. | BD-001, BD-013 |
   | AR-3 | A climber fought alone is a free kill, by design. | BD-005, BD-006, BD-013 |
   | AR-4 | The climber will sometimes finish a climb toward a player who has already left, looking briefly wrong-footed. | BD-008 |
   | AR-5 | Once the novelty passes, the climber fights identically to a knifeman. | BD-011 |
   | AR-6 | Late waves become harder; returning players will notice. | BD-019 |
   | AR-7 | "Existing enemies unchanged" rests on human observation, not mechanical proof. | BD-015 |
   | AR-8 | No independent review and no fresh-eyes play-test. | BD-018 |
   | AR-9 | The reusable-ladder investment stays unproven until a second level exists. | BD-016 |
   | AR-10 | A player far from any ladder is effectively safe on a platform. | BD-004 |

   ---

   ## 10. Handover to Architecture

   **Business Clarification is complete.** Architecture may now begin.

   **Settled — architecture may treat these as fixed:** every rule in §7, every
   amendment in §8, and every accepted risk in §9.

   **Explicitly left to architecture — not business decisions:**

   1. How ladders are represented in level data and rendered.
   2. How the climber perceives a target above it, given BR-02 forbids changing the
      shared awareness limit for existing types.
   3. How vertical movement is achieved alongside the engine's unconditional gravity.
   4. Whether the new type extends the shared enemy class or is separated from it —
      noting CSU §17 R1 identifies the single shared class as the dominant risk, and
      BR-01 makes protecting existing behaviour non-negotiable.
   5. What "reasonably close" (BR-10) is in concrete terms.
   6. How enemy separation behaviour interacts with a climber (CSU §17 R5).
   7. Ladder placement within the level.

   **Prerequisite:** the Project Owner should acknowledge the §8 amendments,
   particularly **A-1**, since it changes what this work will be judged against.

   ---

   **Conversation status:** ✅ **CONV-002 complete — all business decisions resolved.**
   **Next stage:** Architecture (ROLE-002 — Solution Architect).
