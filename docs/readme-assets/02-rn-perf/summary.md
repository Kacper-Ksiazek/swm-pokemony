### Example 1.1. - PostDetailHeader

**🔴 Problem:**

Tapping the like button inside `PostDetailHeader` fires a setState update on the parent component, which re-renders the entire `PostDetailScreen` component. 

Due to lack of memoization of expensive computations, we see a redundant perf degradation.


**🟢 Solution:**
