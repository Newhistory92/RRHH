# Graph Report - .  (2026-06-19)

## Corpus Check
- 138 files · ~69,563 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 731 nodes · 1390 edges · 41 communities (34 shown, 7 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 4 edges (avg confidence: 0.79)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 26|Community 26]]
- [[_COMMUNITY_Community 27|Community 27]]
- [[_COMMUNITY_Community 29|Community 29]]
- [[_COMMUNITY_Community 30|Community 30]]
- [[_COMMUNITY_Community 31|Community 31]]
- [[_COMMUNITY_Community 32|Community 32]]
- [[_COMMUNITY_Community 35|Community 35]]
- [[_COMMUNITY_Community 36|Community 36]]
- [[_COMMUNITY_Community 38|Community 38]]
- [[_COMMUNITY_Community 39|Community 39]]
- [[_COMMUNITY_Community 40|Community 40]]

## God Nodes (most connected - your core abstractions)
1. `Employee` - 66 edges
2. `Department` - 17 edges
3. `compilerOptions` - 16 edges
4. `LicenseHistory` - 15 edges
5. `Office` - 15 edges
6. `ModalContext` - 11 edges
7. `apiClient` - 11 edges
8. `ChatResponse` - 10 edges
9. `Usuario` - 10 edges
10. `SoftSkill` - 10 edges

## Surprising Connections (you probably didn't know these)
- `RRHH Next.js Project` --conceptually_related_to--> `TypeScript Compiler Errors (tsc output)`  [INFERRED]
  README.md → tsc_output.txt
- `CvProps` --references--> `Employee`  [EXTRACTED]
  src/app/Componentes/CvComponente/DatosPersonales.tsx → src/app/Interfas/Interfaces.ts
- `LicenseDetailModalProps` --references--> `LicenseHistory`  [EXTRACTED]
  src/app/Componentes/ModalRRHH/LicenseModal.tsx → src/app/Interfas/Interfaces.ts
- `PermissionModalProps` --references--> `Employee`  [EXTRACTED]
  src/app/Componentes/ModalRRHH/LicenseModal.tsx → src/app/Interfas/Interfaces.ts
- `EmployeeTemplatesProps` --references--> `Employee`  [EXTRACTED]
  src/app/Componentes/Orgamograma/Componente/EmployeeTemplates.tsx → src/app/Interfas/Interfaces.ts

## Import Cycles
- None detected.

## Communities (41 total, 7 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.08
Nodes (15): BaseMetrics, DepartmentAnalysis, Employee, skillsGap, parseAIResponse(), groupEmployeesByDepartment(), DepartmentAnalyzer, ExecutiveSummaryGenerator (+7 more)

### Community 1 - "Community 1"
Cohesion: 0.07
Nodes (13): ChatMessage, ChatRequest, ChatResponse, MCPClient, GeminiService, CaseStudyService, GenerateCaseStudyRequest, ChatService (+5 more)

### Community 2 - "Community 2"
Cohesion: 0.06
Nodes (35): SKILLS, AddSkillDialog(), AddSkillDialogProps, BasicFields(), DepartmentFields(), DropdownChangeEvent, EmployeeOptionParam, EmployeeTemplateProps (+27 more)

### Community 3 - "Community 3"
Cohesion: 0.09
Nodes (27): NodeColors, OrgChartProps, OrgData, OrgNode, OrgStatsType, ExpandButton(), ExpandButtonProps, NodeCard() (+19 more)

### Community 4 - "Community 4"
Cohesion: 0.07
Nodes (30): ApiResponse, ApiUser, RolesApiResponse, EmployeeDetailModal(), CvProps, GenderOption, genderOptions, Role (+22 more)

### Community 5 - "Community 5"
Cohesion: 0.05
Nodes (39): dependencies, ai, @ai-sdk/google-vertex, date-fns, ia, @js-temporal/polyfill, lucide-react, @modelcontextprotocol/server-filesystem (+31 more)

### Community 6 - "Community 6"
Cohesion: 0.07
Nodes (21): EmployeeCVProps, CvFormacionProps, CvFormacionProps, CvFormacionProps, CvFormacionProps, AcademicFormation, certifications, Language (+13 more)

### Community 7 - "Community 7"
Cohesion: 0.06
Nodes (28): ACTIVITY_TYPES, AVAILABLE_SKILLS, DEPARTMENTS, EMPLOYEE_ROLES, EMPLOYEES_DATA, EMPLOYMENT_STATUS, EX_EMPLEADOS, initialProfessions (+20 more)

### Community 8 - "Community 8"
Cohesion: 0.06
Nodes (34): Absences, Answer, Aprobacion, BaseTest, CaseStudyTest, Complaint, CondicionLaboral, ConfiguracionLicenciaData (+26 more)

### Community 9 - "Community 9"
Cohesion: 0.10
Nodes (24): IAPage(), Notification, Page, DepartmentOptimization(), HRChatbot(), HRChatbotProps, Message, MessageRole (+16 more)

### Community 10 - "Community 10"
Cohesion: 0.10
Nodes (22): CvFormacionProps, FeedbackResponse, FeedbackTab(), FeedbackTabProps, Survey, UserData, FeedbackPage(), Question (+14 more)

### Community 11 - "Community 11"
Cohesion: 0.15
Nodes (22): Department, ModalContext, Office, DepartmentManagementViewProps, DepartmentDetails(), DepartmentDetailsProps, DepartmentHeader(), DepartmentHeaderProps (+14 more)

### Community 12 - "Community 12"
Cohesion: 0.15
Nodes (20): OrgAnalysisDepartment, OrgAnalysisEmployee, OrgAnalysisReport, RelocationProposal, RiskHeatMapEntry, SkillGapEntry, SPOFEntry, analyzeSkillGaps() (+12 more)

### Community 13 - "Community 13"
Cohesion: 0.15
Nodes (18): EmployeeStatus, Message, ProcessedMessage, ApplyLicenseModal(), ApplyLicenseModalProps, LicenseDetailModal(), LicenseDetailModalProps, PermissionModal() (+10 more)

### Community 14 - "Community 14"
Cohesion: 0.14
Nodes (15): Licenses, Permit, formatDate(), LicenseHistoryTab(), LicenseHistoryTabProps, PermissionHistoryTab(), ProfileTab(), TipoDisponible (+7 more)

### Community 15 - "Community 15"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 16 - "Community 16"
Cohesion: 0.15
Nodes (13): RequestFormProps, ICONOS, Props, SolicitudParsed, STATUS, ApprovalModal(), ApprovalModalProps, Supervisor (+5 more)

### Community 17 - "Community 17"
Cohesion: 0.15
Nodes (16): app/page.tsx, create-next-app, Geist font family, next/font, Next.js, RRHH Next.js Project, Vercel Platform, data-grouping.ts (+8 more)

### Community 18 - "Community 18"
Cohesion: 0.24
Nodes (13): DateRangePicker(), DateRangePickerProps, useIsMobile(), countBusinessDays(), fromNativeDate(), HolidayApi, isWeekend(), MOVEABLE_DATES (+5 more)

### Community 19 - "Community 19"
Cohesion: 0.15
Nodes (8): LICENCIA_DEFAULTS, TipoDisponible, TiposLicencia, getAvailableLicenses(), LICENSE_MAX_CONSTRAINTS, RRHH_EXCLUSIVE_LICENSES, generarPlantillaVacaciones(), PlantillaParams

### Community 20 - "Community 20"
Cohesion: 0.27
Nodes (7): GlobalStats(), GlobalStatsProps, EstadisticasMetadata, Filters, GlobalStatsData, SortConfig, StatsEmployee

### Community 21 - "Community 21"
Cohesion: 0.22
Nodes (9): SortDirection, EmployeeTableView(), EmployeeTableViewProps, SortableHeaderProps, SortableKeys, SortConfig, ViewState, HoursDisplay() (+1 more)

### Community 22 - "Community 22"
Cohesion: 0.29
Nodes (5): ProductivityRanking(), PaginationProps, SortableKey, StatsProductivityRankingProps, Pagination()

### Community 23 - "Community 23"
Cohesion: 0.25
Nodes (6): ConfiguracionLicencia, CONTRATOS, SortField, SortOrder, TIPOS_LICENCIA, EmploymentStatus

### Community 24 - "Community 24"
Cohesion: 0.32
Nodes (5): ConteinerLicencia, RequestForm, apiClient, handleUnauthorized(), request()

### Community 26 - "Community 26"
Cohesion: 0.40
Nodes (3): geistMono, geistSans, metadata

### Community 27 - "Community 27"
Cohesion: 0.40
Nodes (4): compat, __dirname, eslintConfig, __filename

### Community 30 - "Community 30"
Cohesion: 0.50
Nodes (3): RISK_THRESHOLDS, SEVERITY_ORDER, SKILL_LEVELS

### Community 31 - "Community 31"
Cohesion: 1.00
Nodes (3): Constants.ts, Interfaces.ts, SkillSeverity type

### Community 32 - "Community 32"
Cohesion: 0.67
Nodes (3): FormularioLicencia.tsx, LicenseHistory type, LicenseModal.tsx

## Ambiguous Edges - Review These
- `Interfaces.ts` → `SkillSeverity type`  [AMBIGUOUS]
  tsc_output.txt · relation: references

## Knowledge Gaps
- **202 isolated node(s):** `__filename`, `__dirname`, `compat`, `eslintConfig`, `PROTECTED_PATHS` (+197 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **7 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `Interfaces.ts` and `SkillSeverity type`?**
  _Edge tagged AMBIGUOUS (relation: references) - confidence is low._
- **Why does `Employee` connect `Community 0` to `Community 2`, `Community 4`, `Community 6`, `Community 8`, `Community 9`, `Community 11`, `Community 13`, `Community 14`, `Community 16`, `Community 19`, `Community 21`, `Community 22`?**
  _High betweenness centrality (0.086) - this node is a cross-community bridge._
- **Why does `ChatResponse` connect `Community 1` to `Community 8`?**
  _High betweenness centrality (0.010) - this node is a cross-community bridge._
- **Why does `MCPClient` connect `Community 1` to `Community 8`?**
  _High betweenness centrality (0.008) - this node is a cross-community bridge._
- **What connects `__filename`, `__dirname`, `compat` to the rest of the system?**
  _202 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.0841799709724238 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.06787330316742081 - nodes in this community are weakly interconnected._