import re

with open('src/lib/knowledgeMock.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix id:20 DOCX unassigned -> 101
content = content.replace(
    "id: 20, name: '客户成功案例：大鹎集团', album: '', format: 'DOCX',",
    "id: 101, name: '客户成功案例：大鹏集团', album: '', format: 'DOCX',"
)
# Fix id:21 PPTX unassigned -> 102
content = content.replace(
    "id: 21, name: '2026 品牌升级发布会 PPT', album: '', format: 'PPTX',",
    "id: 102, name: '2026 品牌升级发布会 PPT', album: '', format: 'PPTX',"
)

# Fix garbled DOCX snippet - match any version of the garbled text
content = re.sub(
    r"'项目背景\n.*?业务总监 Edward'",
    "'项目背景\n大鹏集团将内部文档管理切换至本平台，项目周期从 9 天缩短至 8.5 天\n核心成果\n知识搜索响应 < 200ms；多层权限体系全面落地；自动标签准确率 91%\n用户反馈\n\"找文件终于不用求人了\" —— 业务总监 Edward'",
    content,
    flags=re.DOTALL
)

# Fix garbled PPTX snippet
content = content.replace(
    "课题三：路走规划 2026—2028",
    "课题三：战略规划 2026—2028"
)

with open('src/lib/knowledgeMock.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed successfully")
