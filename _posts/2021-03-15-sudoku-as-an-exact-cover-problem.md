---
layout: post
title: Solving Sudokus using Artificial Intelligence
cover: hexadecimal_sudoku.png
date:   2021-03-15 12:00:00
categories: posts
tags: python coursework
---

## Introduction
As part of my Artificial Intelligence module at the University of Bath, I was assigned coursework to write an AI agent in Python
to solve sudoku puzzles. We were told that 30 seconds was an absolute upper limit for a single puzzle, and we should
be aiming for under 1 second. 

Though I used Python, and this may be referenced occasionally in this post, it should be possible to apply the theory to
other programming languages.

[View this project on GitHub.](https://github.com/ouked/sudoku_solver)

## First Attempt: Simple backtracking and constraint propagation (2 seconds)

My first attempt was a simple backtracking algorithm, based of off a solution for the 8 queens problem that we had recently 
studied in lectures: a simple implementation of **backtracking** and **constraint-propagation**.
This solution would recursively try each of a cell's possible values, and update the associated cells' possible values accordingly:
similar to how me or you would go about solving the same problem. 

The first time this worked it took the agent about **40 seconds** to solve a single "hard" puzzle. I was happy to find
that my code was working, though I wanted to aim to solve a single puzzle in under a second on my machine.

After optimisations including simplifying loops, caching, forward-checking, value frequency analysis and implementing a
specialised `deepcopy` function, I got this time down to about **2 seconds**: a lot closer, but still too slow.

## Second Attempt: Exact Cover (<7 milliseconds)

I decided to start again, and learnt how to approach sudokus as **exact cover** problems (mainly thanks to Andy G's 2011
blog post). My first implementation of Donald Knuth's (2000, p.4) Algorithm X resulted in a hard sudoku taking
**10 seconds**.

This was worse than my previous _best_, but a lot better than my previous _first_ attempt. Through similar (but fewer)
optimisations (includng the complete removal of deep-copying objects), my submission now takes **less than 7
milliseconds** to solve a "hard" sudoku puzzle.

## Exact Covers
### What is an Exact Cover?

An **exact cover** is a collection of subsets of `S` such that every element in `S` is found in _exactly one_ of the
subsets. (Dahlke, 2019)

#### Example

Given a set `S` and the subsets `A`, `B`, `C`, `D`, `E`:

- `S = {1, 2, 3, 4, 5, 6, 7}`


- `A = {1, 6, 7}`

- `B = {1, 3, 5}`

- `C = {2}`

- `D = {3, 4, 5}`

- `E = {1, 2, 3, 4}`

Then the exact cover of `S` is the sets `A`, `C`, `D`:

- ```A ∪ C ∪ D = S``` (The subsets cover _every_ element in `S`)


- ```A ∩ C ∩ D = {}``` (Every element in `S` is covered by _only one_ set)

### Solving Exact Cover Problems with Donald Knuth's Algorithm X

Before we discuss how we solve sudokus specifically, let's explore how to solve a _general_ exact cover problem.

**Algorithm X** solves exact cover problems by using a matrix `A`, consisting of 1s and 0s. Let's put the above example
in such a matrix...

|     | 1 | 2 | 3 | 4 | 5 | 6 | 7 |
|:---:|---|---|---|---|---|---|---|
| A   | 1 | 0 | 0 | 0 | 0 | 1 | 1 |
| B   | 1 | 0 | 1 | 0 | 1 | 0 | 0 |
| C   | 0 | 1 | 0 | 0 | 0 | 0 | 0 |
| D   | 0 | 0 | 1 | 1 | 1 | 0 | 0 |
| E   | 1 | 1 | 1 | 1 | 0 | 0 | 0 |

The algorithm is as follows:

```
If A is empty, the problem is solved; terminate successfully.

Otherwise choose a column, c (deterministically).
Choose a row, r, such that A[r, c] = 1 (nondeterministically).

Include r in the partial solution.

For each j such that A[r, j] = 1, 
    delete column j from matrix A; 
    
    for each i such that A[i, j] = 1,
        delete row i from matrix A.
        
Repeat this algorithm recursively on the reduced matrix A.
```

_Knuth's (2000, p.4) Algorithm X_

In simpler terms, the algorithm takes an element `e` to cover, and finds a row which does so. This row is added to the
solution, and every row that also covers `e` is removed from `A`, along with every column that the chosen row also
satisfies.

Selecting row `A`, and doing this described reduction leads to the reduced matrix `A`:

|     | 2 | 3 | 4 | 5 |
|:---:|---|---|---|---|
| C   | 1 | 0 | 0 | 0 |
| D   | 0 | 1 | 1 | 1 |


`Solution = {A}`

- Row `A` was removed and **added to our solution**.
- Rows `B` and `E` were removed because they also covered element `1`.
- Columns `1`, `6`, `7` were removed because they were covered by row `A`.

You can see how doing the same steps again will reduce this matrix further, and will lead to a valid solution being
found.

## Sudoku as an Exact Cover Problem

To approach sudoku as an exact cover problem, you must step back from the sudoku grid, and think about what a solved
sudoku contains:

- A set of **filled cells**
- A set of **rows**, each with one of each number `1-9`
- A set of **columns**, each with one of each number `1-9`
- A set of **blocks**, each with one of each number `1-9`

... and we can also think about what it means to write a value `v` to a cell `(row, column)` in the sudoku grid:

- This unique RCV (Row, Column, Value) will help to satisfy a unique combination of the constraints listed above.

- No other cell in the grid should satisfy the same constraints, as this would mean there were duplicate values. (i.e
  The constraint "Row 1 should contain the value 5" should only be satisfied once).

- ... so every constraint needs to be satisfied by exactly one RCV triple.

This is now an exact cover problem - **every element in our set of constraints needs to be covered exactly once**!

From what we've realised from the nature of sudoku puzzles, we can construct our matrix `A` to represent our constraints
and associated RCV combinations. The following is a few rows and columns from the large (324 x 729) matrix:

|      Constraints     | 0,0,1 | 0,0,2 |   | 4,4,1 |
|----------------------|-------|-------|---|-------|
| Cell 0,0 has a value | 1     | 0     |   |   0   |
| Cell 0,1 has a value | 1     | 0     |   |   0   |
||
| Row 0 contains a 1   | 1     | 0     |   |   0   |
| Row 0 contains a 2   | 0     | 1     |   |   0   |
||
| Col 0 contains a 1   | 1     | 0     |   |   0   |
| Col 0 contains a 2   | 0     | 1     |   |   0   |
||
| Block 4 contains a 1 | 0     | 0     |   |   1   |

Now that we have our matrix `A`, we can apply Algorithm X to generate solutions.

### Implementing Algorithm X
#### Backtracking
Algorithm X is a backtracking function - it exploits the nature of recursing (and "un-recursing") to find the correct
solution.

If the first RCV that is tested doesn't lead to a goal state, the algorithm will backtrack and any changes made to the
`SudokuState` object will need to be abandoned.

Initially this was achieved by creating a deep copy of the `SudokuState` object at each level of the recursion, creating
independent copies of mutable fields (namely `A`). However, creating these copies was inefficient and slowed the
algorithm down significantly.

After attempting to fix this by writing a new, specialised, and therefore faster `deepcopy`
function, I decided it would be better to use the same object, and instead store changes to the matrix in the
appropriate recursion level in a `list` named `removed`. As the algorithm works back up the recursion levels, it will
undo these changes by calling `remove_solution`, restoring the matrix back to how it was for the level above it.

#### Constraint Propagation

The act of removing rows and columns from matrix `A` after a row is chosen is a strict and efficient way of propagating
constraints.

## Optimisations for Python
The following are optimisations that I used at one point in the development of the project to reduce processing time: not all of them are necessary
for Algorithm X.

### Caching (First attempt)
Before using Algorithm X, I decreased the processing time significantly by caching rows, column and blocks that had
already been validated in a shared dictionary for all puzzles. Rows, columns and blocks can all be considered
equivalent, as they all require one of each value `1-9`, regardless of order. Blocks were flattened to make them
equivalent to rows and columns.

I didn't know that the built-in Python module `functools` has a caching function, so I wrote simple code to put results
in a dictionary.

Part of the success of this optimisation was the fact that the algorithm would spend slightly longer on the faster
puzzles (those classed as "very_easy", "easy", or "medium") to speed up the processing of the slower puzzles.

It was faster to store the permutations (where order matters) instead of the combinations (where order doesn't matter),
so the algorithm would generate 24806 permutations from the testing data, compared to the 520 possible combinations.
This obviously increased space complexity of the algorithm dramatically, but processing time was my main priority.

Now that the code uses Algorithm X, there is no need to check for valid combinations of numbers, so there currently is
no caching.

### Specialised `deepcopy` method (First attempt)

Profiling my code uncovered the fact that `deepcopy` was taking up the most processing time, so I needed to reduce the
time it took.

As the `copy.deepcopy` function is made to make an independent copy of an **arbitrary** object, it will be doing a lot
of unnecessary processing in most cases. Looking at the source code in `copy.py` shows the amount of checks that occur
everytime a copy is made. These checks would be necessary if the object I was copying contained references to itself
(Python Software Foundation, 2021), however in this particular case, it doesn't.

Writing a new `deepcopy` method was as simple as creating a new object of the same class, and setting the fields to the
values of the copied object.

Here is an example specialised `deepcopy`.

```python
def __deepcopy__(self, memodict={}):
    """
    Perform a deepcopy on SudokuState.
    IMPORTANT: New fields added to the class SudokuState also need to be added here.
    :return: New object
    """

    cls = self.__class__
    state = cls.__new__(cls)

    # Copy old values to new values
    state.foo = self.foo

    # For lists and sets, we have to copy the values to new objects
    state.bar = [item for item in self.bar]

    # ...

    return state
```

> **Note**: This is a precise, fast and error-prone way of copying an object. This approach requires you to update
> `deepcopy` every time a new field is added to the target class.

### Removing and Restoring RCVs (Second Attempt)

The new `deepcopy` being used for a while in my second attempt, though now it uses the `add_solution`, `remove_solution`
functions to make and abandon changes made to the same object through the recursions, by calling
`remove_conflicting_rcvs`, and `restore_rcvs` respectfully.

### Removed Enums (Second Attempt)

Initially, I was using enums for constraints, but after researching online, I found that Python's slow enums have been 
commonly complained about, and were at one point 20x slower than normal lookups (Python 3.4) (craigh, 2015).
This has been fixed, though there is still an open issue on the python bug tracker complaining about the speed for Python 3.9. (MrMrRobat, 2019)

I converted all enums to strings at the end of development of my second attempt for a considerable speed increase.

## Future Development
Given more time, I'd have liked to implement the following:

- Solving **16x16 hexadecimal sudokus**, such as this one:

![Hex sudoku](http://4.bp.blogspot.com/-OuYfLL6Ofvo/Ut-Ko5IffJI/AAAAAAAAAGE/fNqAj8Q8U1A/s1600/2014-01-22-puzzle.png)

_(mattspuzzleblog, 2014)_

- Multi-threading

## References / Further Reading

Knuth, D. 2000. Dancing Links. _Millenial Perspectives in Computer Science, 2000, 187--214_, Knuth migration 11/2004, pp
4

Dahlke, K. 2019.
_Exact Cover_ [Online]. Available from: https://www.mathreference.com/lan-cx-np,excov.html
[Accessed 11 March 2021]

G, Andy. 2011.
_Solving Sudoku, Revisited_ [Online]. Andy G's Blog. Available
from: https://gieseanw.wordpress.com/2011/06/16/solving-sudoku-revisited/
[Accessed 11 March 2021]

Python Software Foundation. 2021.
_copy — Shallow and deep copy operations_ [Online]. Python 3.9.2 Documentation. Available
from: https://docs.python.org/3/library/copy.html
[Accessed 11 March 2021]

craigh, 2015.
_Enum member lookup is 20x slower than normal class attribute lookup_ [Online]. Available
from: https://bugs.python.org/issue23486
[Accessed 11 March 2021]

MrMrRobat, 2019.
_Increase Enum performance_ [Online]. Available from: https://bugs.python.org/issue39102
[Accessed 11 March 2021]

mattspuzzleblog, 2014. 2014-01-22 Hexadecimal Sudoku Available
from: http://mattspuzzleblog.blogspot.com/2014/01/2014-01-22-hexadecimal-sudoku.html
[Accessed 11 March 2021]
