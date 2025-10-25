// "use client";

// import * as React from "react";
// import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

// import { useIsMobile } from "@/hooks/use-mobile";
// import {
//   Card,
//   CardAction,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import {
//   ChartConfig,
//   ChartContainer,
//   ChartTooltip,
//   ChartTooltipContent,
// } from "@/components/ui/chart";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

// import raw from "@/json/applications.json";

// export const description = "Funding vs Lending Applications";

// type RawApp = {
//   id: string;
//   customerName: string;
//   productType: string;
//   amount: number;
//   date: string;
//   status: string;
//   sales: string;
//   coordinator: string;
// };

// type ChartData = {
//   date: string;
//   funding: number;
//   lending: number;
// };

// const apps = raw as RawApp[];
// const chartDataMap: Record<string, { funding: number; lending: number }> = {};

// for (const app of apps) {
//   const date = app.date;
//   const type = app.productType.toLowerCase();

//   if (!chartDataMap[date]) {
//     chartDataMap[date] = { funding: 0, lending: 0 };
//   }

//   if (type === "funding") {
//     chartDataMap[date].funding += app.amount;
//   } else if (type === "lending") {
//     chartDataMap[date].lending += app.amount;
//   }
// }

// const chartData: ChartData[] = Object.entries(chartDataMap)
//   .map(([date, values]) => ({ date, ...values }))
//   .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

// const chartConfig = {
//   funding: {
//     label: "Funding",
//     color: "var(--primary)",
//   },
//   lending: {
//     label: "Lending",
//     color: "var(--accent)",
//   },
// } satisfies ChartConfig;

// export function ChartAreaDashboard() {
//   const isMobile = useIsMobile();
//   const [timeRange, setTimeRange] = React.useState("90d");

//   React.useEffect(() => {
//     if (isMobile) {
//       setTimeRange("7d");
//     }
//   }, [isMobile]);

//   const filteredData = chartData.filter((item) => {
//     const date = new Date(item.date);
//     const referenceDate = new Date();
//     let daysToSubtract = 90;
//     if (timeRange === "30d") daysToSubtract = 30;
//     else if (timeRange === "7d") daysToSubtract = 7;

//     const startDate = new Date(referenceDate);
//     startDate.setDate(startDate.getDate() - daysToSubtract);
//     return date >= startDate;
//   });

//   return (
//     <Card className="@container/card">
//       <CardHeader>
//         <CardTitle>Funding & Lending Overview</CardTitle>
//         <CardDescription>
//           <span className="hidden @[540px]/card:block">
//             Application summary by product type
//           </span>
//           <span className="@[540px]/card:hidden">Summary by product</span>
//         </CardDescription>
//         <CardAction>
//           <ToggleGroup
//             type="single"
//             value={timeRange}
//             onValueChange={setTimeRange}
//             variant="outline"
//             className="hidden *:data-[slot=toggle-group-item]:!px-4 @[767px]/card:flex"
//           >
//             <ToggleGroupItem value="90d">Last 3 months</ToggleGroupItem>
//             <ToggleGroupItem value="30d">Last 30 days</ToggleGroupItem>
//             <ToggleGroupItem value="7d">Last 7 days</ToggleGroupItem>
//           </ToggleGroup>
//           <Select value={timeRange} onValueChange={setTimeRange}>
//             <SelectTrigger
//               className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
//               size="sm"
//               aria-label="Select a value"
//             >
//               <SelectValue placeholder="Last 3 months" />
//             </SelectTrigger>
//             <SelectContent className="rounded-xl">
//               <SelectItem value="90d" className="rounded-lg">
//                 Last 3 months
//               </SelectItem>
//               <SelectItem value="30d" className="rounded-lg">
//                 Last 30 days
//               </SelectItem>
//               <SelectItem value="7d" className="rounded-lg">
//                 Last 7 days
//               </SelectItem>
//             </SelectContent>
//           </Select>
//         </CardAction>
//       </CardHeader>
//       <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
//         <ChartContainer
//           config={chartConfig}
//           className="aspect-auto h-[250px] w-full"
//         >
//           <AreaChart data={filteredData}>
//             <defs>
//               <linearGradient id="fillFunding" x1="0" y1="0" x2="0" y2="1">
//                 <stop
//                   offset="5%"
//                   stopColor="var(--color-funding)"
//                   stopOpacity={0.8}
//                 />
//                 <stop
//                   offset="95%"
//                   stopColor="var(--color-funding)"
//                   stopOpacity={0.1}
//                 />
//               </linearGradient>
//               <linearGradient id="fillLending" x1="0" y1="0" x2="0" y2="1">
//                 <stop
//                   offset="5%"
//                   stopColor="var(--color-lending)"
//                   stopOpacity={0.8}
//                 />
//                 <stop
//                   offset="95%"
//                   stopColor="var(--color-lending)"
//                   stopOpacity={0.1}
//                 />
//               </linearGradient>
//             </defs>
//             <CartesianGrid vertical={false} />
//             <XAxis
//               dataKey="date"
//               tickLine={false}
//               axisLine={false}
//               tickMargin={8}
//               minTickGap={32}
//               tickFormatter={(value) => {
//                 const date = new Date(value);
//                 return date.toLocaleDateString("en-US", {
//                   month: "short",
//                   day: "numeric",
//                 });
//               }}
//             />
//             <ChartTooltip
//               cursor={false}
//               defaultIndex={isMobile ? -1 : 10}
//               content={
//                 <ChartTooltipContent
//                   labelFormatter={(value) => {
//                     return new Date(value).toLocaleDateString("en-US", {
//                       month: "short",
//                       day: "numeric",
//                     });
//                   }}
//                   indicator="dot"
//                 />
//               }
//             />
//             <Area
//               dataKey="funding"
//               type="natural"
//               fill="url(#fillFunding)"
//               stroke="var(--color-funding)"
//               stackId="a"
//             />
//             <Area
//               dataKey="lending"
//               type="natural"
//               fill="url(#fillLending)"
//               stroke="var(--color-lending)"
//               stackId="a"
//             />
//           </AreaChart>
//         </ChartContainer>
//       </CardContent>
//     </Card>
//   );
// }
