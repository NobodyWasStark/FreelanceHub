    function addSkillPrompt() {
      const skill = prompt('Enter a skill:');
      if (!skill || !skill.trim()) return;
      const container = document.getElementById('skills-container');
      const addBtn = container.querySelector('button[onclick="addSkillPrompt()"]');
      const tag = document.createElement('span');
      tag.className = 'inline-flex items-center gap-1.5 bg-green-50 text-green-700 border border-green-200 px-3 py-1 rounded-full text-xs font-semibold';
      tag.innerHTML = skill.trim() + ' <button onclick="removeSkill(this)" class="text-green-500 hover:text-green-800 transition-colors leading-none bg-transparent border-none cursor-pointer p-0 text-sm">×</button>';
      container.insertBefore(tag, addBtn);
    }