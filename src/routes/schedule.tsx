import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { SchedulePage as ScheduleComponent } from '@/pages/schedule'
import { useNavigate } from '@tanstack/react-router'
import { useState } from 'react'

export const Route = createFileRoute('/schedule')({
  component: ScheduleWrapper,
})

function ScheduleWrapper() {
  const navigate = useNavigate()
  const [scheduleDay, setScheduleDay] = useState(0)
  const [country, setCountry] = useState("US")

  // Use TanStack Query for schedule to avoid refetching on every mount/home navigation
  const d = new Date()
  d.setDate(d.getDate() + scheduleDay)
  const dateStr = d.toISOString().split('T')[0]

  const { data, isLoading } = useQuery({
    queryKey: ['schedule', country, dateStr],
    queryFn: async () => {
      const res = await fetch(`https://api.tvmaze.com/schedule?country=${country}&date=${dateStr}`)
      return res.json()
    },
    staleTime: 1000 * 60 * 15, // 15 minutes
  })
  
  return (
    <ScheduleComponent 
      data={data || []}
      loading={isLoading}
      scheduleDay={scheduleDay}
      setScheduleDay={setScheduleDay}
      country={country}
      setCountry={setCountry}
      handleSelectShow={(show) => navigate({ to: '/show/$id', params: { id: show.id.toString() } })} 
    />
  )
}
