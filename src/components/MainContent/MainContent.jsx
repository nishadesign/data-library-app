import React from 'react'
import { Search, Filter, ChevronDown, ExternalLink, CloudCog } from 'lucide-react'
import {
  DataLibrariesIconBlue,
  DocumentIcon,
  KnowledgeIcon,
  WebsiteIcon,
  CustomRetrieverIcon,
  HandPointerIcon,
  GlobeIcon,
  SalesforceConnectorIcon,
  JiraConnectorIcon,
  GitHubConnectorIcon,
  SlackConnectorIcon,
} from '../../assets/icons'
import { Button } from '../ui/button'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '../ui/dropdown-menu'
import { Tooltip, TooltipTrigger, TooltipContent } from '../ui/tooltip'
import { Input } from '../ui/input'
import DataSourceCard from '../DataSourceCard/DataSourceCard'

export default function MainContent({ onNewLibrary }) {
  return (
    <main className="flex-1 bg-background overflow-y-auto flex flex-col">
      {/* Title Bar */}
      <div className="flex items-center justify-between py-3 px-6 border-b border-border shrink-0">
        <div className="flex items-center gap-2.5">
          <DataLibrariesIconBlue size={28} />
          <h1 className="text-lg font-bold text-foreground m-0 font-sans">Data Libraries</h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 border border-input rounded px-3 py-[5px] bg-background w-[180px] focus-within:border-ring focus-within:ring-1 focus-within:ring-ring">
            <Search size={14} className="text-muted-foreground" />
            <input
              type="text"
              placeholder="Search..."
              className="border-none outline-none text-[13px] font-sans text-foreground flex-1 bg-transparent placeholder:text-muted-foreground"
            />
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="icon" size="icon" aria-label="Filter">
                <Filter size={16} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Filter</TooltipContent>
          </Tooltip>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="brand">
                Add Data
                <ChevronDown size={10} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[260px]">
              <DropdownMenuItem onClick={() => onNewLibrary?.()}>
                <DocumentIcon size={20} />
                <span className="flex-1">Files</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <KnowledgeIcon size={20} />
                <span className="flex-1">Salesforce Knowledge</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <WebsiteIcon size={20} />
                <span className="flex-1">Websites</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <CustomRetrieverIcon size={20} />
                <span className="flex-1">Custom Retrievers</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <CloudCog size={20} className="text-muted-foreground" />
                <span className="flex-1">Data Cloud Connectors</span>
                <ExternalLink size={14} className="text-muted-foreground" />
              </DropdownMenuItem>
              <DropdownMenuItem>
                <GlobeIcon size={20} />
                <span className="flex-1">MCP Servers</span>
                <ExternalLink size={14} className="text-muted-foreground" />
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Empty State */}
      <div className="py-7 px-6">
        <h2 className="text-xl font-bold text-foreground m-0 mb-2 font-sans">
          Quick start by adding data, we'll handle the rest!
        </h2>
        <p className="text-[13px] text-muted-foreground leading-relaxed m-0 mb-6 max-w-[720px] font-sans">
          After you add your data, we'll read it, prepare it for search, and make sure your agent can use it reliably. You can track progress at each step and review the results before going live.
          <br />
          <a href="#" className="inline-flex items-center gap-1 text-primary no-underline text-[13px] font-normal hover:underline">
            Learn more in help
            <ExternalLink size={11} className="text-primary" />
          </a>
        </p>

        <div className="grid grid-cols-[repeat(4,minmax(0,200px))] gap-3 max-[900px]:grid-cols-2">
          <DataSourceCard
            icon={<DocumentIcon size={28} />}
            label="Upload Files"
            overlay={<HandPointerIcon size={22} />}
            onClick={onNewLibrary}
          />
          <DataSourceCard
            icon={<KnowledgeIcon size={28} />}
            label="Add Knowledge Articles"
          />
          <DataSourceCard
            icon={<WebsiteIcon size={28} />}
            label="Search Websites"
          />
          <DataSourceCard
            icon={<CustomRetrieverIcon size={28} />}
            label="Custom Retrievers"
          />
          <DataSourceCard
            icon={null}
            badges={
              <>
                <SalesforceConnectorIcon size={26} />
                <JiraConnectorIcon size={26} />
                <GitHubConnectorIcon size={26} />
                <SlackConnectorIcon size={26} />
              </>
            }
            badgeMore="+32 more"
            label="Data Cloud Connectors"
            externalLink
          />
          <DataSourceCard
            icon={<GlobeIcon size={28} />}
            label="Use MCP servers"
            externalLink
          />
        </div>
      </div>
    </main>
  )
}
