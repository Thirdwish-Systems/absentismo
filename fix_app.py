import os

path = r"c:\Users\Domingo\Desktop\absentismo\absentismo\absentismo\reference\modulo home+framework.txt"
dest = r"c:\Users\Domingo\Desktop\absentismo\absentismo\absentismo\src\App.tsx"

with open(path, "r", encoding="utf-8") as f:
    content = f.read()

# Add imports
imports = """
import Module1 from "./components/Module1/Module1";
import Module2Container from "./components/Module2/Module2Container";
import Module3Container from "./components/Module3/Module3Container";
import Module4 from "./components/Module4/Module4";
"""
content = content.replace('} from "lucide-react";', '} from "lucide-react";' + imports)

# Replace navigation
old_nav = 'view === "diag" ? <ModuleSlot t="M?dulo 1: Diagn?stico" /> : view === "cost" ? <ModuleSlot t="M?dulo 2: P&L" /> : view === "pred" ? <ModuleSlot t="M?dulo 3: Predicci?n" /> : <ModuleSlot t="M?dulo 4: Workflows" />'
# The file might have different ? placeholders, let's use a regex-like replace or just find the main parts
import re
pattern = r'view === "diag" \? <ModuleSlot t="M.dulo 1: Diagn.stico" /> : view === "cost" \? <ModuleSlot t="M.dulo 2: P&L" /> : view === "pred" \? <ModuleSlot t="M.dulo 3: Predicci.n" /> : <ModuleSlot t="M.dulo 4: Workflows" />'
new_nav = 'view === "diag" ? <Module1 /> : view === "cost" ? <Module2Container /> : view === "pred" ? <Module3Container /> : <Module4 />'

content = re.sub(r'view === "diag" \? <ModuleSlot.*?Workflows" />', new_nav, content)

with open(dest, "w", encoding="utf-8") as f:
    f.write(content)

print("Done")
