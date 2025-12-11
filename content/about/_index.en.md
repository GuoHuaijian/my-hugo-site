---
title: "👋 About"
description: "About Me"
---

## Hi, I'm **[Your Name]**

A backend developer who loves open-source projects, cloud-native technologies, and building cool things.

---

## Skills

{{< chart >}}
type: 'bar',
data: {
labels: ['Go', 'Python', 'JavaScript', 'Docker', 'Kubernetes'],
datasets: [{
label: 'Proficiency',
data: [90, 85, 75, 80, 70],
backgroundColor: [
'rgba(54, 162, 235, 0.7)',
'rgba(75, 192, 192, 0.7)',
'rgba(255, 206, 86, 0.7)',
'rgba(153, 102, 255, 0.7)',
'rgba(255, 159, 64, 0.7)'
]
}]
},
options: {
indexAxis: 'y',
plugins: {
legend: { display: false }
}
}
{{< /chart >}}

---

## Experience

{{< timeline >}}

{{% timelineItem icon="code" header="Present" badge="2024" %}}
Focused on cloud-native development and backend architecture.
{{% /timelineItem %}}

{{% timelineItem icon="graduation-cap" header="Graduation" badge="2020" %}}
Bachelor’s Degree in Computer Science and Technology.
{{% /timelineItem %}}

{{< /timeline >}}

---

## Contact

{{< button href="https://github.com/yourname" target="_blank" >}}
{{< icon "github" >}} GitHub
{{< /button >}}

{{< button href="mailto:your@email.com" >}}
{{< icon "email" >}} Email
{{< /button >}}

---

## Site Info

{{< alert "circle-info" >}}
- Framework: [Hugo](https://gohugo.io/)
- Theme: [Blowfish](https://blowfish.page/)
- Hosting: GitHub Pages
  {{< /alert >}}
