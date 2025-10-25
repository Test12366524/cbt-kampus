"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  useGetGeneralSettingQuery,
  useUpdateGeneralSettingMutation,
} from "@/services/settings.service";

export default function SettingPage() {
  const { data: setting, isLoading } = useGetGeneralSettingQuery();
  const [updateSetting, { isLoading: isSaving }] =
    useUpdateGeneralSettingMutation();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    about: "",
    google_analytics: "",
    mail_driver: "",
    mail_host: "",
    mail_port: "",
    mail_encryption: "",
    mail_username: "",
    mail_password: "",
    mail_from_address: "",
    mail_from_name: "",
  });

  useEffect(() => {
    if (setting) {
      setFormData({
        name: setting.name || "",
        email: setting.email || "",
        phone: setting.phone || "",
        address: setting.address || "",
        about: setting.about || "",
        google_analytics: setting.google_analytics || "",
        mail_driver: setting.mail_driver || "",
        mail_host: setting.mail_host || "",
        mail_port: setting.mail_port || "",
        mail_encryption: setting.mail_encryption || "",
        mail_username: setting.mail_username || "",
        mail_password: setting.mail_password || "",
        mail_from_address: setting.mail_from_address || "",
        mail_from_name: setting.mail_from_name || "",
      });
    }
  }, [setting]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateSetting(formData).unwrap();
      alert("Setting updated successfully!");
    } catch (error) {
      if (error instanceof Error) {
        alert(`Failed to update setting.\n${error.message}`);
      } else {
        alert("Failed to update setting.\nAn unknown error occurred.");
      }
    }          
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>General Settings</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p>Loading...</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Company Name</Label>
              <Input id="name" value={formData.name} onChange={handleChange} />
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>

            <div>
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={handleChange}
              />
            </div>

            <div>
              <Label htmlFor="about">About</Label>
              <Textarea
                id="about"
                value={formData.about}
                onChange={handleChange}
              />
            </div>

            <div>
              <Label htmlFor="google_analytics">Google Analytics</Label>
              <Input
                id="google_analytics"
                value={formData.google_analytics}
                onChange={handleChange}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="mail_driver">Mail Driver</Label>
                <Input
                  id="mail_driver"
                  value={formData.mail_driver}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label htmlFor="mail_host">Mail Host</Label>
                <Input
                  id="mail_host"
                  value={formData.mail_host}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label htmlFor="mail_port">Mail Port</Label>
                <Input
                  id="mail_port"
                  value={formData.mail_port}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label htmlFor="mail_encryption">Encryption</Label>
                <Input
                  id="mail_encryption"
                  value={formData.mail_encryption}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label htmlFor="mail_username">Username</Label>
                <Input
                  id="mail_username"
                  value={formData.mail_username}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label htmlFor="mail_password">Password</Label>
                <Input
                  id="mail_password"
                  type="password"
                  value={formData.mail_password}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label htmlFor="mail_from_address">From Address</Label>
                <Input
                  id="mail_from_address"
                  value={formData.mail_from_address}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label htmlFor="mail_from_name">From Name</Label>
                <Input
                  id="mail_from_name"
                  value={formData.mail_from_name}
                  onChange={handleChange}
                />
              </div>
            </div>

            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
