
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Users, MapPin, Clock, Plus, Save } from "lucide-react";
import { useFileStorage } from "@/hooks/useFileStorage";
import { toast } from "sonner";

interface Event {
  id: string;
  name: string;
  date: string;
  location: string;
  capacity: number;
  registered: number;
  status: 'upcoming' | 'ongoing' | 'completed';
}

interface Attendee {
  id: string;
  name: string;
  email: string;
  eventId: string;
  registrationDate: string;
  attended: boolean;
}

const Attendify = () => {
  const { loadData, saveData, isLoaded, setIsLoaded, serverConnected } = useFileStorage('attendify');
  const [events, setEvents] = useState<Event[]>([]);
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [newEventName, setNewEventName] = useState('');
  const [newEventDate, setNewEventDate] = useState('');
  const [newEventLocation, setNewEventLocation] = useState('');
  const [newEventCapacity, setNewEventCapacity] = useState('');

  useEffect(() => {
    const loadInitialData = async () => {
      const data = await loadData();
      if (data) {
        setEvents(data.events || []);
        setAttendees(data.attendees || []);
      }
      setIsLoaded(true);
    };
    loadInitialData();
  }, []);

  useEffect(() => {
    if (isLoaded) {
      saveData({
        events,
        attendees,
        lastUpdated: new Date().toISOString()
      });
    }
  }, [events, attendees, isLoaded]);

  const handleCreateEvent = () => {
    if (!newEventName || !newEventDate || !newEventLocation || !newEventCapacity) {
      toast.error('Please fill all event details');
      return;
    }

    const newEvent: Event = {
      id: Date.now().toString(),
      name: newEventName,
      date: newEventDate,
      location: newEventLocation,
      capacity: parseInt(newEventCapacity),
      registered: 0,
      status: 'upcoming'
    };

    setEvents([...events, newEvent]);
    setNewEventName('');
    setNewEventDate('');
    setNewEventLocation('');
    setNewEventCapacity('');
    toast.success('Event created successfully!');
  };

  const handleSaveData = async () => {
    await saveData({
      events,
      attendees,
      lastUpdated: new Date().toISOString()
    });
  };

  const getEventAttendees = (eventId: string) => {
    return attendees.filter(attendee => attendee.eventId === eventId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 p-6">
      <div className="container mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-bold text-white flex items-center gap-3">
            <Calendar className="h-8 w-8 text-blue-400" />
            Attendify Dashboard
          </h1>
          <div className="flex items-center gap-4">
            <Badge variant={serverConnected ? "default" : "destructive"}>
              {serverConnected ? "Server Connected" : "Server Disconnected"}
            </Badge>
            <Button onClick={handleSaveData} className="bg-green-600 hover:bg-green-500">
              <Save className="h-4 w-4 mr-2" />
              Save Data
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-blue-800/30 border-blue-600/50 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <Calendar className="h-8 w-8 text-blue-300 mx-auto mb-2" />
              <h3 className="text-blue-200 text-sm">Total Events</h3>
              <p className="text-2xl font-bold text-blue-100">{events.length}</p>
            </CardContent>
          </Card>
          
          <Card className="bg-purple-800/30 border-purple-600/50 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <Users className="h-8 w-8 text-purple-300 mx-auto mb-2" />
              <h3 className="text-purple-200 text-sm">Total Attendees</h3>
              <p className="text-2xl font-bold text-purple-100">{attendees.length}</p>
            </CardContent>
          </Card>
          
          <Card className="bg-green-800/30 border-green-600/50 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <Clock className="h-8 w-8 text-green-300 mx-auto mb-2" />
              <h3 className="text-green-200 text-sm">Upcoming Events</h3>
              <p className="text-2xl font-bold text-green-100">
                {events.filter(e => e.status === 'upcoming').length}
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-orange-800/30 border-orange-600/50 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <MapPin className="h-8 w-8 text-orange-300 mx-auto mb-2" />
              <h3 className="text-orange-200 text-sm">Completed Events</h3>
              <p className="text-2xl font-bold text-orange-100">
                {events.filter(e => e.status === 'completed').length}
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="events" className="space-y-6">
          <TabsList className="bg-slate-800/50">
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="attendees">Attendees</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="events">
            <div className="space-y-6">
              {/* Create New Event */}
              <Card className="bg-slate-800/30 border-slate-600/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-slate-100 flex items-center gap-2">
                    <Plus className="h-5 w-5" />
                    Create New Event
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Input
                      placeholder="Event Name"
                      value={newEventName}
                      onChange={(e) => setNewEventName(e.target.value)}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                    <Input
                      type="date"
                      value={newEventDate}
                      onChange={(e) => setNewEventDate(e.target.value)}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                    <Input
                      placeholder="Location"
                      value={newEventLocation}
                      onChange={(e) => setNewEventLocation(e.target.value)}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        placeholder="Capacity"
                        value={newEventCapacity}
                        onChange={(e) => setNewEventCapacity(e.target.value)}
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                      <Button onClick={handleCreateEvent}>Create</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Events List */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {events.map(event => (
                  <Card key={event.id} className="bg-slate-800/30 border-slate-600/50 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="text-slate-100">{event.name}</CardTitle>
                      <Badge variant={event.status === 'completed' ? 'default' : 'secondary'}>
                        {event.status}
                      </Badge>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-slate-300">
                        <p className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          {new Date(event.date).toLocaleDateString()}
                        </p>
                        <p className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          {event.location}
                        </p>
                        <p className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          {getEventAttendees(event.id).length} / {event.capacity}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="attendees">
            <Card className="bg-slate-800/30 border-slate-600/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-slate-100">Attendee Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300">Attendee management features coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <Card className="bg-slate-800/30 border-slate-600/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-slate-100">Event Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300">Analytics dashboard coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Attendify;
