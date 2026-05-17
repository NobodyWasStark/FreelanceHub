import glob
import re

files = glob.glob('/home/shawn/Videos/finalcheckup/FreelanceHub/skillbridge-*.html')
files.append('/home/shawn/Videos/finalcheckup/FreelanceHub/freelancer-report.html')
for file in files:
    with open(file, 'r') as f:
        content = f.read()

    # The block we are looking for:
    # <a href="#" class="..."><svg ...> ... </svg><span class="text-sm font-medium">Reports</span></a>
    content = re.sub(
        r'<a href="#"([^>]*>\s*<svg[^>]*>.*?<\/svg>\s*<span class="text-sm font-medium">Reports<\/span>\s*<\/a>)',
        r'<a href="./freelancer-report.html"\1',
        content,
        flags=re.DOTALL
    )

    with open(file, 'w') as f:
        f.write(content)
