#define TK_END_OF_FILE                     1
#define TK_ILLEGAL                         2
#define TK_SPACE                           3
#define TK_UNCLOSED_STRING                 4
#define TK_COMMENT                         5
#define TK_FUNCTION                        6
#define TK_COLUMN                          7
#define TK_AGG_FUNCTION                    8
#define TK_SEMI                            9
#define TK_EXPLAIN                        10
#define TK_BEGIN                          11
#define TK_TRANSACTION                    12
#define TK_DEFERRED                       13
#define TK_IMMEDIATE                      14
#define TK_EXCLUSIVE                      15
#define TK_COMMIT                         16
#define TK_END                            17
#define TK_ROLLBACK                       18
#define TK_CREATE                         19
#define TK_TABLE                          20
#define TK_TEMP                           21
#define TK_LP                             22
#define TK_RP                             23
#define TK_AS                             24
#define TK_COMMA                          25
#define TK_ID                             26
#define TK_ABORT                          27
#define TK_AFTER                          28
#define TK_ASC                            29
#define TK_ATTACH                         30
#define TK_BEFORE                         31
#define TK_CASCADE                        32
#define TK_CONFLICT                       33
#define TK_DATABASE                       34
#define TK_DESC                           35
#define TK_DETACH                         36
#define TK_EACH                           37
#define TK_FAIL                           38
#define TK_FOR                            39
#define TK_GLOB                           40
#define TK_IGNORE                         41
#define TK_INITIALLY                      42
#define TK_INSTEAD                        43
#define TK_LIKE                           44
#define TK_MATCH                          45
#define TK_KEY                            46
#define TK_OF                             47
#define TK_OFFSET                         48
#define TK_PRAGMA                         49
#define TK_RAISE                          50
#define TK_REPLACE                        51
#define TK_RESTRICT                       52
#define TK_ROW                            53
#define TK_STATEMENT                      54
#define TK_TRIGGER                        55
#define TK_VACUUM                         56
#define TK_VIEW                           57
#define TK_OR                             58
#define TK_AND                            59
#define TK_NOT                            60
#define TK_IS                             61
#define TK_BETWEEN                        62
#define TK_IN                             63
#define TK_ISNULL                         64
#define TK_NOTNULL                        65
#define TK_NE                             66
#define TK_EQ                             67
#define TK_GT                             68
#define TK_LE                             69
#define TK_LT                             70
#define TK_GE                             71
#define TK_BITAND                         72
#define TK_BITOR                          73
#define TK_LSHIFT                         74
#define TK_RSHIFT                         75
#define TK_PLUS                           76
#define TK_MINUS                          77
#define TK_STAR                           78
#define TK_SLASH                          79
#define TK_REM                            80
#define TK_CONCAT                         81
#define TK_UMINUS                         82
#define TK_UPLUS                          83
#define TK_BITNOT                         84
#define TK_STRING                         85
#define TK_JOIN_KW                        86
#define TK_INTEGER                        87
#define TK_CONSTRAINT                     88
#define TK_DEFAULT                        89
#define TK_FLOAT                          90
#define TK_NULL                           91
#define TK_PRIMARY                        92
#define TK_UNIQUE                         93
#define TK_CHECK                          94
#define TK_REFERENCES                     95
#define TK_COLLATE                        96
#define TK_ON                             97
#define TK_DELETE                         98
#define TK_UPDATE                         99
#define TK_INSERT                         100
#define TK_SET                            101
#define TK_DEFERRABLE                     102
#define TK_FOREIGN                        103
#define TK_DROP                           104
#define TK_UNION                          105
#define TK_ALL                            106
#define TK_INTERSECT                      107
#define TK_EXCEPT                         108
#define TK_SELECT                         109
#define TK_DISTINCT                       110
#define TK_DOT                            111
#define TK_FROM                           112
#define TK_JOIN                           113
#define TK_USING                          114
#define TK_ORDER                          115
#define TK_BY                             116
#define TK_GROUP                          117
#define TK_HAVING                         118
#define TK_LIMIT                          119
#define TK_WHERE                          120
#define TK_INTO                           121
#define TK_VALUES                         122
#define TK_BLOB                           123
#define TK_VARIABLE                       124
#define TK_CASE                           125
#define TK_WHEN                           126
#define TK_THEN                           127
#define TK_ELSE                           128
#define TK_INDEX                          129
