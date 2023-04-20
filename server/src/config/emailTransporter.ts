import nodemailer from 'nodemailer';
import nodemailerStub from 'nodemailer-stub';

export const transporter = nodemailer.createTransport(nodemailerStub.stubTransport);