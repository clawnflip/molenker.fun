"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import NewTokens from "@/components/NewTokens";
import HotTokens from "@/components/HotTokens";
import VolumeTokens from "@/components/VolumeTokens";
import SkillSection from "@/components/SkillSection";
import FilterBar from "@/components/FilterBar";
import TokenGrid from "@/components/TokenGrid";
import CreateTokenModal from "@/components/CreateTokenModal";

export default function Home() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState("new");

  return (
    <div className="app-container">
      {/* Sidebar */}
      <Sidebar onCreateClick={() => setIsCreateModalOpen(true)} />
      
      {/* Main Content */}
      <main className="main-content">
        {/* Header */}
        <Header onCreateClick={() => setIsCreateModalOpen(true)} />
        
        {/* Skill Section - Prominent */}
        <SkillSection />
        
        {/* New Launches - Live Updates */}
        <NewTokens />
        
        {/* Content Grid */}
        <div className="content-grid">
          <div className="content-main">
            {/* Filter Bar */}
            <FilterBar 
              activeFilter={activeFilter} 
              onFilterChange={setActiveFilter} 
            />
            
            {/* Token Grid */}
            <TokenGrid filter={activeFilter} />
          </div>
          
          {/* Right Sidebar */}
          <div className="content-sidebar">
            <HotTokens />
            <VolumeTokens />
          </div>
        </div>
      </main>
      
      {/* Create Token Modal */}
      {isCreateModalOpen && (
        <CreateTokenModal onClose={() => setIsCreateModalOpen(false)} />
      )}
    </div>
  );
}
