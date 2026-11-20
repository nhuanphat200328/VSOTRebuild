export type ArchiveConference = {
  year: number;
  name: string;
  dates?: string;
  location?: string;
  href?: string;
  kind: "site" | "document" | "pending";
  cover?: string;
  current?: boolean;
};

// 2026 is the current site and is intentionally not listed here.
// 2020, 2024 have no archived website; 2018/2019/2021 PHP are pending.
export const archiveConferences: ArchiveConference[] = [
  {
    year: 2025,
    name: "Hội nghị khoa học thường niên VSOT 2025",
    href: "/legacy/2025/index.html",
    kind: "site",
    cover: "/legacy/2025/hoinghi-2025.jpg",
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
    dates: "09–10/12/2022",
    href: "/legacy/2022/index.html",
    kind: "site",
  },
  {
    year: 2021,
    name: "Hội nghị khoa học thường niên VSOT 2021",
    kind: "pending",
  },
  {
    year: 2019,
    name: "Hội nghị khoa học thường niên VSOT 2019",
    kind: "pending",
  },
  {
    year: 2018,
    name: "Hội nghị khoa học thường niên VSOT 2018",
    kind: "pending",
  },
];
