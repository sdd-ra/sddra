Struktur:
  - scripts/split-chat-history.mjs — chat_history.md-ni ayırıcıya (___...___) görə bölür, prompt/{1-N}.md yaradır. İstədiyin vaxt node scripts/split-chat-history.mjs
  ilə yenidən işə sala bilərsən (faylı yenidən oxuyub bölgünü təzələyir).
  - scripts/curate-prompts.mjs — bölünmüş faylları süzür: "next"-only olanları at, real olanları yenidən nömrələyib köçür. node scripts/curate-prompts.mjs ilə işə
  düşür.

  Nəticə:
  - prompt/old/ → orijinal 140 fayl (1.md–140.md), toxunulmamış, arxiv olaraq.
  - prompt/new/ → yalnız 89 real məzmunlu fayl, ardıcıl 1.md–89.md kimi yenidən nömrələnib (51 "next"-only boş parça atıldı).
  - prompt/ kökündə artıq başqa fayl yoxdur, yalnız bu iki qovluq var.

  Növbəti addım (sənin qeyd etdiyin "next" iş rejimi): bundan sonra mən prompt/new/ içindəki faylları 1-dən başlayaraq bir-bir oxuyub, hər faylda göstərilən mətnə uyğun
  işə başlayacam — amma yalnız sən "next" dediyində, əvvəlcədən yox. İstəsən, indi "next" yaz, mən prompt/new/1.md-i oxuyub başlayım.
