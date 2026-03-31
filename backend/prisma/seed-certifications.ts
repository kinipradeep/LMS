import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const certTracks = [
  {
    code: 'CISSP',
    name: 'Certified Information Systems Security Professional',
    body: 'ISC2',
    description:
      'The CISSP is the gold standard for information security professionals, covering 8 domains of cybersecurity knowledge.',
    domains: [
      { number: 1, name: 'Security and Risk Management', weightPct: 16, description: 'Confidentiality, integrity, availability, risk management, compliance, law, regulations, and business continuity.' },
      { number: 2, name: 'Asset Security', weightPct: 10, description: 'Protecting organizational assets, data classification, privacy protection, and retention policies.' },
      { number: 3, name: 'Security Architecture and Engineering', weightPct: 13, description: 'Security models, design principles, cryptography, and securing physical infrastructure.' },
      { number: 4, name: 'Communication and Network Security', weightPct: 13, description: 'Secure network architecture, transmission, channels, and components.' },
      { number: 5, name: 'Identity and Access Management (IAM)', weightPct: 13, description: 'Controlling access to assets, identity management, authentication, and authorisation.' },
      { number: 6, name: 'Security Assessment and Testing', weightPct: 12, description: 'Designing, performing, and analysing security testing, audits, and control assessments.' },
      { number: 7, name: 'Security Operations', weightPct: 13, description: 'Investigations, incident management, disaster recovery, and physical security.' },
      { number: 8, name: 'Software Development Security', weightPct: 10, description: 'Security in the software development lifecycle, APIs, and secure coding practices.' },
    ],
  },
  {
    code: 'CISM',
    name: 'Certified Information Security Manager',
    body: 'ISACA',
    description:
      'CISM focuses on information security management, ideal for those managing enterprise information security programs.',
    domains: [
      { number: 1, name: 'Information Security Governance', weightPct: 17, description: 'Establishing and maintaining security governance aligned with business goals.' },
      { number: 2, name: 'Information Security Risk Management', weightPct: 20, description: 'Identifying and managing information security risk to acceptable levels.' },
      { number: 3, name: 'Information Security Program', weightPct: 33, description: 'Developing and managing an information security program.' },
      { number: 4, name: 'Incident Management', weightPct: 30, description: 'Planning and managing the capability to respond to and recover from incidents.' },
    ],
  },
  {
    code: 'CRISC',
    name: 'Certified in Risk and Information Systems Control',
    body: 'ISACA',
    description:
      'CRISC is designed for IT professionals who identify and manage enterprise IT risk through information systems controls.',
    domains: [
      { number: 1, name: 'Governance', weightPct: 26, description: 'Organisational governance and risk governance frameworks.' },
      { number: 2, name: 'IT Risk Assessment', weightPct: 20, description: 'IT risk identification, scenario development, and risk analysis.' },
      { number: 3, name: 'Risk Response and Reporting', weightPct: 32, description: 'Risk response, mitigation, monitoring, and communication.' },
      { number: 4, name: 'Information Technology and Security', weightPct: 22, description: 'IT concepts, architecture, and security controls supporting risk management.' },
    ],
  },
  {
    code: 'CCSP',
    name: 'Certified Cloud Security Professional',
    body: 'ISC2',
    description:
      'CCSP demonstrates advanced technical skills and knowledge for cloud security design, architecture, and operations.',
    domains: [
      { number: 1, name: 'Cloud Concepts, Architecture and Design', weightPct: 17, description: 'Cloud computing concepts, reference architectures, security, and design principles.' },
      { number: 2, name: 'Cloud Data Security', weightPct: 20, description: 'Cloud data lifecycle, security technologies, discovery, classification, and rights management.' },
      { number: 3, name: 'Cloud Platform and Infrastructure Security', weightPct: 17, description: 'Cloud infrastructure, risk management, and security of data centre environments.' },
      { number: 4, name: 'Cloud Application Security', weightPct: 17, description: 'Secure software development, cloud APIs, application security testing.' },
      { number: 5, name: 'Cloud Security Operations', weightPct: 16, description: 'Building and operating physical and logical infrastructure for cloud environments.' },
      { number: 6, name: 'Legal, Risk and Compliance', weightPct: 13, description: 'Legal requirements, privacy issues, audit processes, and risk management.' },
    ],
  },
  {
    code: 'CEH',
    name: 'Certified Ethical Hacker',
    body: 'EC-Council',
    description:
      'CEH teaches hacking tools and techniques used by malicious hackers so professionals can defend against them.',
    domains: [
      { number: 1, name: 'Introduction to Ethical Hacking', weightPct: 6, description: 'Fundamentals of ethical hacking, cybersecurity laws, and hacking methodologies.' },
      { number: 2, name: 'Footprinting and Reconnaissance', weightPct: 9, description: 'Information gathering techniques and tools used in ethical hacking.' },
      { number: 3, name: 'Scanning Networks', weightPct: 9, description: 'Network scanning techniques, tools, and countermeasures.' },
      { number: 4, name: 'Enumeration', weightPct: 9, description: 'Enumeration techniques for network resources and services.' },
      { number: 5, name: 'Vulnerability Analysis', weightPct: 10, description: 'Vulnerability assessment techniques and classification systems.' },
      { number: 6, name: 'System Hacking', weightPct: 10, description: 'System hacking methodology, steganography, and covering tracks.' },
      { number: 7, name: 'Malware Threats', weightPct: 8, description: 'Malware concepts, Trojans, viruses, ransomware, and countermeasures.' },
      { number: 8, name: 'Sniffing', weightPct: 8, description: 'Network sniffing techniques, protocols susceptible to sniffing.' },
      { number: 9, name: 'Social Engineering', weightPct: 8, description: 'Social engineering techniques, insider threats, identity theft.' },
      { number: 10, name: 'Denial-of-Service', weightPct: 8, description: 'DoS/DDoS attacks, botnets, and countermeasures.' },
      { number: 11, name: 'Web Application Hacking', weightPct: 15, description: 'Web application architecture, threats, and hacking methodology.' },
    ],
  },
];

async function main() {
  console.log('🌱 Seeding certification tracks...');

  for (const track of certTracks) {
    const { domains, ...trackData } = track;

    const created = await prisma.certificationTrack.upsert({
      where: { code: trackData.code },
      update: {},
      create: trackData,
    });

    console.log(`  ✅ ${created.code} — ${created.name}`);

    for (const domain of domains) {
      await prisma.certDomain.upsert({
        where: {
          // composite unique: trackId + number
          trackId_number: { trackId: created.id, number: domain.number },
        },
        update: {},
        create: { ...domain, trackId: created.id },
      });
    }
    console.log(`     └─ ${domains.length} domains seeded`);
  }

  console.log('\n✅ All certification tracks seeded successfully.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
