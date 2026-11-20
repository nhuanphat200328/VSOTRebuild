export type ArchiveConference = {
  year: number;
  name: string;
  dates?: string;
  location?: string;
  href: string;
  kind: "site" | "document";
  cover?: string;
  current?: boolean;
};

// URLs verified on 2026-11-20. 2026 is the live legacy conference website.
// Years without a real website (2020, 2024) are intentionally absent.
export const archiveConferences: ArchiveConference[] = [
  {
    year: 2025,
    name: "Hội nghị khoa học thường niên VSOT 2025",
    href: "https://vsot.com.vn/hoinghi2025/",
    kind: "site",
    cover: "/archive/covers/vsot-2025.jpg",
  },
  {
    year: 2023,
    name: "Chương trình hội nghị VSOT 2023",
    href: "/archive/2023/chuong-trinh-vsot-2023.pdf",
    kind: "document",
  },
  {
    year: 2022,
    name: "Hội nghị khoa học thường niên VSOT 2022",
    location: "TP. Hồ Chí Minh",
    href: "https://vsot.com.vn/hoinghi2022/chuong-trinh-hoi-nghi-final.htm",
    kind: "site",
  },
  {
    year: 2021,
    name: "Hội nghị khoa học thường niên VSOT 2021",
    href: "https://vsot.com.vn/chuongtrinhhoinghi2021/",
    kind: "site",
  },
  {
    year: 2019,
    name: "Hội nghị khoa học thường niên VSOT 2019",
    href: "https://vsot.com.vn/chuongtrinhhoinghi2019/",
    kind: "site",
  },
  {
    year: 2018,
    name: "Hội nghị khoa học thường niên VSOT 2018",
    href: "https://vsot.com.vn/chuongtrinhhoinghi2018/",
    kind: "site",
  },
];
