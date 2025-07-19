"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import React from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

interface Crumb {
  label: string;
  href?: string;
}

export function DynamicBreadcrumb() {
  const pathname = usePathname();

  // Generate breadcrumb items from pathname
  const generateBreadcrumbs = (): Crumb[] => {
    const segments = pathname.split("/").filter(Boolean);
    if (segments.length === 0) return [];
    const breadcrumbs: Crumb[] = [];
    let currentPath = "";
    segments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      // Convert segment to readable label
      const label = segment
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
      if (index === segments.length - 1) {
        breadcrumbs.push({ label });
      // } else if (segment !== "dashboard") {
      } else {
        breadcrumbs.push({ label, href: currentPath });
      }
    });
    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();
  if (breadcrumbs.length === 1 && breadcrumbs[0].label === "Home") {
    return null;
  }

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {breadcrumbs.map((item, index) => (
          <React.Fragment key={index}>
            <BreadcrumbItem>
              {item.href ? (
                <BreadcrumbLink asChild>
                  <Link href={item.href}>{item.label}</Link>
                </BreadcrumbLink>
              ) : (
                <BreadcrumbPage>{item.label}</BreadcrumbPage>
              )}
            </BreadcrumbItem>
            {index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
} 