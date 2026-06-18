with open(".jules/sentinel.md", "r") as f:
    content = f.read()

import re
content = re.compile(r'\.## ').sub(r'.\n\n## ', content)

with open(".jules/sentinel.md", "w") as f:
    f.write(content)
