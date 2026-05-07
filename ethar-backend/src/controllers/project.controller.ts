import { Request, Response } from "express";
import prisma from "../config/db";

export const getProjects = async (req: any, res: any) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const projects = await prisma.project.findMany({
      where: {
        OR: [
          { ownerId: user.id },
          user.teamId ? { teamId: user.teamId } : {},
        ].filter(Boolean) as any,
      },
      include: { tasks: true },
    });
    res.status(200).json(projects);
  } catch (error) {
    console.error("[Get Projects Error]", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const createProject = async (req: any, res: any) => {
  try {
    const { name, description } = req.body;
    if (!name) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const project = await prisma.project.create({
      data: { 
        name, 
        description, 
        ownerId: user.id,
        teamId: user.teamId || undefined 
      },
    });
    res.status(201).json(project);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
