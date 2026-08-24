# Statutory Commutation Factor Lookup Table

This document details the age-factor lookup values for pension commutation under the **Tripura Civil Services (Pension) Rules**.

```text
Age Next Birthday      Factor (ROP 2017/2018)     Factor (Legacy ROP)
-----------------      ----------------------     -------------------
55                     8.771                      8.771
56                     8.665                      8.665
57                     8.557                      8.557
58                     8.446                      8.471
59                     8.371                      8.371
60                     8.287                      8.287
61                     8.194                      8.194
62                     8.093                      8.093
63                     7.982                      7.982
64                     7.862                      7.862
65                     7.731                      7.731
```

*Note: In PAYFIX Engine, commutation factors are retrieved dynamically via `get_commutation_factor(age_next_birthday, rop_version)` rather than hardcoding static constants.*
