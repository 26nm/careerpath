/**
 * DashboardLayout.js
 *
 * Provides a consistent layout for all dashboard-related routes.
 * Renders the Sidebar alongside a main content area, which is
 * dynamically filled by nested routes using React Router's <Outlet />.
 *
 * By: Nolan Dela Rosa
 *
 * August 4, 2025
 */
import React from "react";
import Sidebar from "./Sidebar";
import { Outlet } from "react-router-dom";
import "../styles/DashboardLayout.css";

/**
 * DashboardLayout Component
 *
 * This layout wraps all dashboard pages with a sidebar and a main content area.
 * The <Sidebar /> remains persistent across views, while <Outlet /> renders
 * the current route's content inside the main section.
 *
 * Used by route: /dashboard/*
 */
function DashboardLayout() {
  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="main-content">
        <Outlet />
      </div>
    </div>
  );
}

export default DashboardLayout;
